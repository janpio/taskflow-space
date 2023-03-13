import { createTRPCRouter } from "~/server/api/trpc";
import { DashboardRouter } from "./routers/dashboard";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: DashboardRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;