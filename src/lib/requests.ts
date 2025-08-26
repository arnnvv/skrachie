import { InMemoryRateLimiter } from "./rate-limit";
import { getClientIp } from "./ip";

export const globalBucket = new InMemoryRateLimiter<string>(100, 1);

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = await getClientIp();
  if (clientIP === null) return true;

  return globalBucket.consume(clientIP, 1);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = await getClientIp();
  if (clientIP === null) return true;

  return globalBucket.consume(clientIP, 3);
}
