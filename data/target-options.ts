import type {
  GenderPresentation,
  PersonalityPreset,
  RoleType,
} from "../types/workflow";

export const ROLE_LABELS: Record<RoleType, string> = {
  leader: "领导",
  client: "甲方/客户",
  peer: "同事",
};

export const GENDER_LABELS: Record<GenderPresentation, string> = {
  male: "男",
  female: "女",
};

export const PERSONALITY_LABELS: Record<PersonalityPreset, string> = {
  strong: "强势",
  rigorous: "严谨",
  casual: "随性",
  easygoing: "佛系",
  suspicious: "多疑",
};

export const ROLE_OPTIONS = [
  {
    value: "leader",
    label: ROLE_LABELS.leader,
    description: "直属上级",
    avatarLabel: "领",
  },
  {
    value: "client",
    label: ROLE_LABELS.client,
    description: "外部合作方",
    avatarLabel: "甲",
  },
  {
    value: "peer",
    label: ROLE_LABELS.peer,
    description: "平级协作",
    avatarLabel: "同",
  },
] as const satisfies readonly {
  value: RoleType;
  label: string;
  description: string;
  avatarLabel: string;
}[];

export const GENDER_OPTIONS = [
  { value: "male", label: GENDER_LABELS.male },
  { value: "female", label: GENDER_LABELS.female },
] as const satisfies readonly {
  value: GenderPresentation;
  label: string;
}[];

export const PERSONALITY_OPTIONS = [
  { value: "strong", label: PERSONALITY_LABELS.strong },
  { value: "rigorous", label: PERSONALITY_LABELS.rigorous },
  { value: "casual", label: PERSONALITY_LABELS.casual },
  { value: "easygoing", label: PERSONALITY_LABELS.easygoing },
  { value: "suspicious", label: PERSONALITY_LABELS.suspicious },
] as const satisfies readonly {
  value: PersonalityPreset;
  label: string;
}[];
