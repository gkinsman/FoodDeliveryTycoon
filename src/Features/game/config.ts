export const config = {
  msPerHour: 5000 * 100,
  commission: 0.15,
}

export function gameMinuteToEngineMs(gameMinutes: number): number {
  return (gameMinutes * config.msPerHour) / 60 / 100
}
