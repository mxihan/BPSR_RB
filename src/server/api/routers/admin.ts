import { z } from "zod";
import {
  createTRPCRouter,
  adminProcedure,
} from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  // Dashboard stats
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalTeams,
      openTeams,
      totalProfiles,
      totalApplications,
      pendingApplications,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.team.count(),
      ctx.db.team.count({ where: { status: "OPEN" } }),
      ctx.db.playerProfile.count(),
      ctx.db.application.count(),
      ctx.db.application.count({ where: { status: "PENDING" } }),
    ]);

    return {
      totalUsers,
      totalTeams,
      openTeams,
      totalProfiles,
      totalApplications,
      pendingApplications,
    };
  }),

  // List users with filtering
  listUsers: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          role: z.enum(["USER", "LEADER", "ADMIN"]).optional(),
          banned: z.boolean().optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const users = await ctx.db.user.findMany({
        where: {
          ...(input?.search && {
            OR: [
              { name: { contains: input.search } },
              { email: { contains: input.search } },
            ],
          }),
          ...(input?.role && { role: input.role }),
          ...(input?.banned !== undefined && { banned: input.banned }),
        },
        include: {
          _count: {
            select: {
              profiles: true,
              ledTeams: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(input?.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: string | undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return { items: users, nextCursor };
    }),

  // Change user role
  changeUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["USER", "LEADER", "ADMIN"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),

  // Ban/unban user
  toggleBan: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banned: z.boolean(),
        banReason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: {
          banned: input.banned,
          banReason: input.banned ? input.banReason : null,
        },
      });
    }),

  // List all teams for moderation
  listTeams: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const teams = await ctx.db.team.findMany({
        where: {
          ...(input?.search && {
            OR: [
              { title: { contains: input.search } },
              { description: { contains: input.search } },
            ],
          }),
          ...(input?.status && { status: input.status }),
        },
        include: {
          leader: { select: { id: true, name: true, email: true } },
          content: true,
          _count: { select: { applications: true, members: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(input?.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: string | undefined;
      if (teams.length > limit) {
        const nextItem = teams.pop();
        nextCursor = nextItem!.id;
      }

      return { items: teams, nextCursor };
    }),

  // Admin delete team
  deleteTeam: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.team.delete({ where: { id: input.id } });
    }),
});
