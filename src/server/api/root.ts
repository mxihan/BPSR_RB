import { dictionaryRouter } from "~/server/api/routers/dictionary";
import { profileRouter } from "~/server/api/routers/profile";
import { teamRouter } from "~/server/api/routers/team";
import { applicationRouter } from "~/server/api/routers/application";
import { notificationRouter } from "~/server/api/routers/notification";
import { commentRouter } from "~/server/api/routers/comment";
import { adminRouter } from "~/server/api/routers/admin";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  dictionary: dictionaryRouter,
  profile: profileRouter,
  team: teamRouter,
  application: applicationRouter,
  notification: notificationRouter,
  comment: commentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
