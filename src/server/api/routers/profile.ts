import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  // Get all profiles for current user
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.playerProfile.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        server: true,
        primaryClass: true,
        primarySpec: true,
        secondaryClass: true,
        secondarySpec: true,
      },
      orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
    });
  }),

  // Get public profile by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.playerProfile.findUnique({
        where: { id: input.id },
        include: {
          server: true,
          primaryClass: { include: { specs: { where: { active: true } } } },
          primarySpec: true,
          secondaryClass: { include: { specs: { where: { active: true } } } },
          secondarySpec: true,
          user: { select: { id: true, name: true, image: true } },
        },
      });
    }),

  // List public profiles (player browser)
  list: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          classId: z.string().optional(),
          serverId: z.string().optional(),
          minAbilityScore: z.number().optional(),
          maxAbilityScore: z.number().optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const profiles = await ctx.db.playerProfile.findMany({
        where: {
          isVisible: true,
          ...(input?.search && {
            displayName: { contains: input.search },
          }),
          ...(input?.classId && { primaryClassId: input.classId }),
          ...(input?.serverId && { serverId: input.serverId }),
          ...(input?.minAbilityScore && {
            abilityScore: { gte: input.minAbilityScore },
          }),
          ...(input?.maxAbilityScore && {
            abilityScore: { lte: input.maxAbilityScore },
          }),
        },
        include: {
          server: true,
          primaryClass: true,
          primarySpec: true,
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(input?.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      });

      let nextCursor: string | undefined;
      if (profiles.length > limit) {
        const nextItem = profiles.pop();
        nextCursor = nextItem!.id;
      }

      return { items: profiles, nextCursor };
    }),

  // Create profile
  create: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(50),
        serverId: z.string().optional(),
        adventurerLevel: z.number().min(1).max(100).optional(),
        primaryClassId: z.string().optional(),
        primarySpecId: z.string().optional(),
        secondaryClassId: z.string().optional(),
        secondarySpecId: z.string().optional(),
        abilityScore: z.number().min(0).optional(),
        dreamLevel: z.number().min(0).max(90).optional(),
        illusionStrength: z.number().min(0).optional(),
        adventurerRank: z.number().min(0).optional(),
        about: z.string().max(1000).optional(),
        timezone: z.string().optional(),
        preferredPlayTimes: z.string().optional(),
        isVisible: z.boolean().default(true),
        isMain: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If this is set as main, unset any existing main
      if (input.isMain) {
        await ctx.db.playerProfile.updateMany({
          where: { userId: ctx.session.user.id, isMain: true },
          data: { isMain: false },
        });
      }

      return ctx.db.playerProfile.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Update profile
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        displayName: z.string().min(1).max(50).optional(),
        serverId: z.string().optional().nullable(),
        adventurerLevel: z.number().min(1).max(100).optional().nullable(),
        primaryClassId: z.string().optional().nullable(),
        primarySpecId: z.string().optional().nullable(),
        secondaryClassId: z.string().optional().nullable(),
        secondarySpecId: z.string().optional().nullable(),
        abilityScore: z.number().min(0).optional().nullable(),
        dreamLevel: z.number().min(0).max(90).optional().nullable(),
        illusionStrength: z.number().min(0).optional().nullable(),
        adventurerRank: z.number().min(0).optional().nullable(),
        about: z.string().max(1000).optional().nullable(),
        timezone: z.string().optional().nullable(),
        preferredPlayTimes: z.string().optional().nullable(),
        isVisible: z.boolean().optional(),
        isMain: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify ownership
      const profile = await ctx.db.playerProfile.findUnique({
        where: { id },
      });
      if (profile?.userId !== ctx.session.user.id) {
        throw new Error("Profile not found or not owned by you");
      }

      // If setting as main, unset others
      if (input.isMain) {
        await ctx.db.playerProfile.updateMany({
          where: { userId: ctx.session.user.id, isMain: true },
          data: { isMain: false },
        });
      }

      return ctx.db.playerProfile.update({
        where: { id },
        data,
      });
    }),

  // Delete profile
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.playerProfile.findUnique({
        where: { id: input.id },
      });
      if (profile?.userId !== ctx.session.user.id) {
        throw new Error("Profile not found or not owned by you");
      }

      return ctx.db.playerProfile.delete({ where: { id: input.id } });
    }),
});
