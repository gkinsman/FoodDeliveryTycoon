export const config = {
  msPerHour: 500 * 1000,
}

export function gameMinuteToEngineMs(gameMinutes: number): number {
  return (gameMinutes * config.msPerHour) / 60
}
