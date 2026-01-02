export const formatTime = (seconds: number) => {
  if (seconds === 0) return "0m";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  }
  if (m > 0) {
    return `${m}m`;
  }
  return `${s}s`;
};