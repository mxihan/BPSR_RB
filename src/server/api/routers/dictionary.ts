import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";

// ============================================
// Public dictionary queries
// ============================================

export const dictionaryRouter = createTRPCRouter({
  // --- Classes ---
  listClasses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.dictClass.findMany({
      where: { active: true },
      include: { specs: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  }),

  // --- Content (Dungeons, Raids, etc.) ---
  listContent: publicProcedure
    .input(
      z
        .object({
          contentType: z.enum([
            "DUNGEON",
            "RAID",
            "WORLD_BOSS",
            "RUSH_BATTLE",
            "TRAINING_RUINS",
            "STIMEN_VAULT",
            "OTHER",
          ]).optional(),
          season: z.enum(["SEASON_1", "SEASON_2", "ANY"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.dictContent.findMany({
        where: {
          active: true,
          ...(input?.contentType && { contentType: input.contentType }),
          ...(input?.season && { season: input.season }),
        },
        orderBy: { sortOrder: "asc" },
      });
    }),

  // --- Difficulties ---
  listDifficulties: publicProcedure
    .input(
      z
        .object({
          contentType: z.enum([
            "DUNGEON",
            "RAID",
            "WORLD_BOSS",
            "RUSH_BATTLE",
            "TRAINING_RUINS",
            "STIMEN_VAULT",
            "OTHER",
          ]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.dictDifficulty.findMany({
        where: {
          active: true,
          ...(input?.contentType && { contentType: input.contentType }),
        },
        orderBy: { sortOrder: "asc" },
      });
    }),

  // --- Servers ---
  listServers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.dictServer.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  }),

  // ============================================
  // Admin CRUD — Classes
  // ============================================
  adminCreateClass: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameJa: z.string().optional(),
        role: z.enum(["Tank", "DPS", "Healer", "Support"]),
        mainStat: z.enum(["Strength", "Agility", "Intellect"]),
        iconUrl: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictClass.create({ data: input });
    }),

  adminUpdateClass: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameJa: z.string().optional(),
        role: z.enum(["Tank", "DPS", "Healer", "Support"]).optional(),
        mainStat: z.enum(["Strength", "Agility", "Intellect"]).optional(),
        iconUrl: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dictClass.update({ where: { id }, data });
    }),

  adminDeleteClass: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictClass.delete({ where: { id: input.id } });
    }),

  // ============================================
  // Admin CRUD — Specs
  // ============================================
  adminCreateSpec: adminProcedure
    .input(
      z.object({
        classId: z.string(),
        name: z.string().min(1),
        nameJa: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictSpec.create({ data: input });
    }),

  adminUpdateSpec: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameJa: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dictSpec.update({ where: { id }, data });
    }),

  adminDeleteSpec: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictSpec.delete({ where: { id: input.id } });
    }),

  // ============================================
  // Admin CRUD — Content
  // ============================================
  adminCreateContent: adminProcedure
    .input(
      z.object({
        contentType: z.enum([
          "DUNGEON", "RAID", "WORLD_BOSS", "RUSH_BATTLE",
          "TRAINING_RUINS", "STIMEN_VAULT", "OTHER",
        ]),
        name: z.string().min(1),
        nameJa: z.string().optional(),
        season: z.enum(["SEASON_1", "SEASON_2", "ANY"]).default("ANY"),
        partySize: z.number().default(4),
        description: z.string().optional(),
        dreamStrengthNormal: z.number().optional(),
        dreamStrengthHard: z.number().optional(),
        dreamStrengthMaster1: z.number().optional(),
        dreamStrengthMaster6: z.number().optional(),
        iconUrl: z.string().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictContent.create({ data: input });
    }),

  adminUpdateContent: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameJa: z.string().optional(),
        season: z.enum(["SEASON_1", "SEASON_2", "ANY"]).optional(),
        partySize: z.number().optional(),
        description: z.string().optional(),
        dreamStrengthNormal: z.number().optional(),
        dreamStrengthHard: z.number().optional(),
        dreamStrengthMaster1: z.number().optional(),
        dreamStrengthMaster6: z.number().optional(),
        iconUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dictContent.update({ where: { id }, data });
    }),

  adminDeleteContent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictContent.delete({ where: { id: input.id } });
    }),

  // ============================================
  // Admin CRUD — Difficulties
  // ============================================
  adminCreateDifficulty: adminProcedure
    .input(
      z.object({
        contentType: z.enum([
          "DUNGEON", "RAID", "WORLD_BOSS", "RUSH_BATTLE",
          "TRAINING_RUINS", "STIMEN_VAULT", "OTHER",
        ]),
        name: z.string().min(1),
        nameJa: z.string().optional(),
        levelBased: z.boolean().default(false),
        minLevel: z.number().optional(),
        maxLevel: z.number().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictDifficulty.create({ data: input });
    }),

  adminUpdateDifficulty: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameJa: z.string().optional(),
        levelBased: z.boolean().optional(),
        minLevel: z.number().optional(),
        maxLevel: z.number().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dictDifficulty.update({ where: { id }, data });
    }),

  adminDeleteDifficulty: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictDifficulty.delete({ where: { id: input.id } });
    }),

  // ============================================
  // Admin CRUD — Servers
  // ============================================
  adminCreateServer: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameJa: z.string().optional(),
        region: z.string().min(1),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictServer.create({ data: input });
    }),

  adminUpdateServer: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        nameJa: z.string().optional(),
        region: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.dictServer.update({ where: { id }, data });
    }),

  adminDeleteServer: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dictServer.delete({ where: { id: input.id } });
    }),
});
