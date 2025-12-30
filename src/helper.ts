export function sleep(ms: number = 3000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomInt(min: number, max: number): number {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export function getRandomItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export function isProductionEnv(): boolean {
  return `${process.env.NODE_ENV?.trim()}` === 'production';
}

export function isDebugModeEnv(): boolean {
  return `${process.env.DEBUG_MODE?.trim()}` === 'true';
}
