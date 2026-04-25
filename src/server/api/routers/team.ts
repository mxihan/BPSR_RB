import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  leaderProcedure,
} from "~/server/api/trpc";

const slotSchema = z.object({
  role: z.enum(["Tank", "DPS", "Healer", "Support"]),
  preferredClassId: z.string().optional().nullable(),
  preferredSpecId: z.string().optional().nullable(),
  minAbilityScore: z.number().optional().nullable(),
  minDreamLevel: z.number().optional().nullable(),
  minIllusionStrength: z.number().optional().nullable(),
});

export const teamRouter = createTRPCRouter({
  // List teams with rich filtering
  list: publicProcedure
    .input(
      z
        .object({
          contentType: z
            .enum([
              "DUNGEON", "RAID", "WORLD_BOSS", "RUSH_BATTLE",
              "TRAINING_RUINS", "STIMEN_VAULT", "OTHER",
            ])
            .optional(),
          contentId: z.string().optional(),
          season: z.enum(["SEASON_1", "SEASON_2", "ANY"]).optional(),
          difficultyId: z.string().optional(),
          status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
          roleNeeded: z.enum(["Tank", "DPS", "Healer", "Support"]).optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          sortBy: z.enum(["newest", "soonest"]).default("newest"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      const where = {
        ...(input?.status && { status: input.status }),
        ...(input?.contentType && { contentType: input.contentType }),
        ...(input?.contentId && { contentId: input.contentId }),
        ...(input?.season && { season: input.season }),
        ...(input?.difficultyId && { difficultyId: input.difficultyId }),
        ...(input?.search && {
          OR: [
            { title: { contains: input.search } },
            { description: { contains: input.search } },
          ],
        }),
        ...(input?.roleNeeded && {
          slots: {
            some: {
              role: input.roleNeeded,
              isFilled: false,
            },
          },
        }),
      };

      const orderBy =
        input?.sortBy === "soonest"
          ? { scheduledAt: "asc" as const }
          : { createdAt: "desc" as const };

      const teams = await ctx.db.team.findMany({
        where,
        include: {
          leader: { select: { id: true, name: true, image: true } },
          content: true,
          difficulty: true,
          slots: {
            include: {
              preferredClass: true,
              filledBy: {
                include: {
                  primaryClass: true,
                  user: { select: { name: true, image: true } },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { applications: true } },
        },
        orderBy,
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

  // Get team by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.team.findUnique({
        where: { id: input.id },
        include: {
          leader: {
            select: { id: true, name: true, image: true, role: true },
          },
          content: true,
          difficulty: true,
          slots: {
            include: {
              preferredClass: true,
              preferredSpec: true,
              filledBy: {
                include: {
                  primaryClass: true,
                  primarySpec: true,
                  user: { select: { name: true, image: true } },
                },
              },
              applications: {
                where: { status: "PENDING" },
                include: {
                  profile: {
                    include: {
                      primaryClass: true,
                      primarySpec: true,
                      user: { select: { name: true, image: true } },
                    },
                  },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
          members: {
            include: {
              profile: {
                include: {
                  primaryClass: true,
                  user: { select: { name: true, image: true } },
                },
              },
            },
          },
          comments: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { applications: true } },
        },
      });
    }),

  // Create team
  create: leaderProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        contentType: z.enum([
          "DUNGEON", "RAID", "WORLD_BOSS", "RUSH_BATTLE",
          "TRAINING_RUINS", "STIMEN_VAULT", "OTHER",
        ]),
        contentId: z.string().optional().nullable(),
        season: z.enum(["SEASON_1", "SEASON_2", "ANY"]).default("ANY"),
        difficultyId: z.string().optional().nullable(),
        masterLevel: z.number().optional().nullable(),
        description: z.string().max(2000).optional().nullable(),
        scheduledAt: z.date().optional().nullable(),
        autoCloseAt: z.date().optional().nullable(),
        maxPartySize: z.number().min(2).max(30).default(4),
        tags: z.string().optional().nullable(),
        slots: z.array(slotSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { slots, ...teamData } = input;

      // Find leader's main profile before creating the team
      const mainProfile = await ctx.db.playerProfile.findFirst({
        where: { userId: ctx.session.user.id, isMain: true },
      });

      const team = await ctx.db.team.create({
        data: {
          ...teamData,
          leaderId: ctx.session.user.id,
          slots: {
            create: slots.map((slot, index) => ({
              ...slot,
              sortOrder: index,
            })),
          },
          ...(mainProfile && {
            members: {
              create: {
                profileId: mainProfile.id,
                role: "Leader",
              },
            },
          }),
        },
        include: { slots: true },
      });

      return team;
    }),

  // Update team
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        contentType: z
          .enum([
            "DUNGEON", "RAID", "WORLD_BOSS", "RUSH_BATTLE",
            "TRAINING_RUINS", "STIMEN_VAULT", "OTHER",
          ])
          .optional(),
        contentId: z.string().optional().nullable(),
        season: z.enum(["SEASON_1", "SEASON_2", "ANY"]).optional(),
        difficultyId: z.string().optional().nullable(),
        masterLevel: z.number().optional().nullable(),
        description: z.string().max(2000).optional().nullable(),
        scheduledAt: z.date().optional().nullable(),
        autoCloseAt: z.date().optional().nullable(),
        maxPartySize: z.number().min(2).max(30).optional(),
        tags: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const team = await ctx.db.team.findUnique({ where: { id } });
      if (!team) throw new Error("Team not found");
      if (
        team.leaderId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized to edit this team");
      }

      return ctx.db.team.update({ where: { id }, data });
    }),

  // Delete team
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({ where: { id: input.id } });
      if (!team) throw new Error("Team not found");
      if (
        team.leaderId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized");
      }

      return ctx.db.team.delete({ where: { id: input.id } });
    }),

  // Change team status
  changeStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({ where: { id: input.id } });
      if (!team) throw new Error("Team not found");
      if (
        team.leaderId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized");
      }

      return ctx.db.team.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  // List my teams (led + joined)
  listMyTeams: protectedProcedure.query(async ({ ctx }) => {
    const ledTeams = ctx.db.team.findMany({
      where: { leaderId: ctx.session.user.id },
      include: {
        content: true,
        difficulty: true,
        slots: {
          include: {
            filledBy: { include: { primaryClass: true } },
          },
        },
        _count: { select: { applications: { where: { status: "PENDING" } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const joinedTeams = ctx.db.team.findMany({
      where: {
        members: {
          some: {
            profile: { userId: ctx.session.user.id },
          },
        },
        leaderId: { not: ctx.session.user.id },
      },
      include: {
        leader: { select: { name: true, image: true } },
        content: true,
        difficulty: true,
        slots: {
          include: {
            filledBy: { include: { primaryClass: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const [led, joined] = await Promise.all([ledTeams, joinedTeams]);
    return { led, joined };
  }),
});
