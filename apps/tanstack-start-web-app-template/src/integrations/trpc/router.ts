import { router } from "./init";
import { healthRouter } from "./routers/health";
import { agentRouter } from "./routers/agent";

export const appRouter = router({
  health: healthRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
