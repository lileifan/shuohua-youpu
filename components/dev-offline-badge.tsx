export function DevOfflineBadge() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <span className="dev-offline-badge">DEV · 离线预设</span>;
}
