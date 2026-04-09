import { Router, type IRouter, type Request, type Response } from "express";
import { processUpdate } from "../lib/processUpdate";
import { logger } from "../lib/logger";
import type { TelegramUpdate } from "../lib/telegram";

const router: IRouter = Router();

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const update = req.body as TelegramUpdate;
    if (!update || typeof update.update_id !== "number") {
      res.status(400).json({ error: "Invalid update" });
      return;
    }

    await processUpdate(update);
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Webhook processing error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
