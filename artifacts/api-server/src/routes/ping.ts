import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.head("/ping", (_req: Request, res: Response) => {
  res.status(200).end();
});

router.get("/ping", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

export default router;
