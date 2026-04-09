import { Router, type IRouter } from "express";
import healthRouter from "./health";
import botRouter from "./bot";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";
import webhookRouter from "./webhook";
import pingRouter from "./ping";

const router: IRouter = Router();

router.use(pingRouter);
router.use(healthRouter);
router.use(webhookRouter);
router.use(botRouter);
router.use(messagesRouter);
router.use(dashboardRouter);

export default router;
