import { AIProviderError } from "@/lib/ai-provider";
import { CoachRequestSchema } from "@/lib/coach-schema";
import {
  CoachServiceError,
  getCoachResponse,
} from "@/lib/coach-service";

export const runtime = "nodejs";

interface PublicApiError {
  code: string;
  message: string;
}

function errorResponse(error: PublicApiError, status: number): Response {
  return Response.json({ error }, { status });
}

function mapServiceError(error: unknown): Response {
  if (error instanceof AIProviderError) {
    switch (error.code) {
      case "AI_CONFIGURATION_ERROR":
        return errorResponse(
          { code: error.code, message: "真实 AI 服务尚未完成配置。" },
          503,
        );
      case "PROVIDER_TIMEOUT":
        return errorResponse(
          { code: error.code, message: "排演请求超时，请稍后再试。" },
          504,
        );
      case "PROVIDER_HTTP_ERROR":
      case "PROVIDER_INVALID_JSON":
      case "PROVIDER_SCHEMA_ERROR":
        return errorResponse(
          { code: error.code, message: "AI 服务暂时无法完成排演。" },
          502,
        );
      case "AI_REQUEST_ABORTED":
        return errorResponse(
          { code: error.code, message: "排演请求已取消。" },
          499,
        );
    }
  }

  if (error instanceof CoachServiceError) {
    switch (error.code) {
      case "CLARIFICATION_LIMIT_REACHED":
        return errorResponse(
          { code: error.code, message: "追问已达到上限，无法继续追问。" },
          422,
        );
      case "PROVIDER_INVALID_JSON":
      case "PROVIDER_SCHEMA_ERROR":
        return errorResponse(
          { code: error.code, message: "AI 返回内容无法安全使用。" },
          502,
        );
      case "COACH_MODE_CONFIGURATION_ERROR":
        return errorResponse(
          { code: error.code, message: "排演服务模式配置无效。" },
          503,
        );
    }
  }

  return errorResponse(
    { code: "INTERNAL_ERROR", message: "排演服务暂时不可用。" },
    500,
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      { code: "INVALID_JSON", message: "请求内容必须是有效 JSON。" },
      400,
    );
  }

  const parsedRequest = CoachRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return errorResponse(
      { code: "INVALID_REQUEST", message: "排演请求内容不完整。" },
      400,
    );
  }

  try {
    const response = await getCoachResponse(parsedRequest.data, {
      signal: request.signal,
    });
    return Response.json(response);
  } catch (error) {
    return mapServiceError(error);
  }
}
