import { getUpdates } from "./telegram";
import { processUpdate } from "./processUpdate";
import { logger } from "./logger";

let lastUpdateId = 0;
let isPolling = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;

async function pollUpdates(): Promise<void> {
  if (isPolling) return;
  isPolling = true;

  try {
    const updates = await getUpdates(100, lastUpdateId > 0 ? lastUpdateId + 1 : undefined);

    for (const update of updates) {
      await processUpdate(update);
      lastUpdateId = Math.max(lastUpdateId, update.update_id);
    }

    if (updates.length > 0) {
      logger.info({ count: updates.length, lastUpdateId }, "Polled updates");
    }
  } catch (err) {
    logger.error({ err }, "Polling error");
  } finally {
    isPolling = false;
  }
}

export function startPolling(intervalMs = 5000): void {
  if (pollInterval) return;

  logger.info({ intervalMs }, "Starting Telegram update polling");
  pollUpdates();
  pollInterval = setInterval(pollUpdates, intervalMs);
}

export function stopPolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    logger.info("Stopped Telegram update polling");
  }
}
