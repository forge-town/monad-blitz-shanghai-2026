export { trpcClient } from "./client";

// Server-only exports — import directly from "./router" or "./init" in server code
// Do NOT re-export here to avoid pulling @trpc/server into client bundles
export type { AppRouter } from "./router";
