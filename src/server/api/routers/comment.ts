import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  // List comments for a team
  list: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.teamComment.findMany({
        where: { teamId: input.teamId },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  // Create comment
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.teamComment.create({
        data: {
          teamId: input.teamId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      // Notify team leader (if not self)
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
      });
      if (team && team.leaderId !== ctx.session.user.id) {
        await ctx.db.notification.create({
          data: {
            userId: team.leaderId,
            type: "team_update",
            title: "New Comment",
            message: `New comment on your team: ${team.title}`,
            link: `/teams/${input.teamId}`,
          },
        });
      }

      return comment;
    }),

  // Delete comment
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.teamComment.findUnique({
        where: { id: input.id },
      });
      if (!comment) throw new Error("Comment not found");
      if (
        comment.userId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized");
      }

      return ctx.db.teamComment.delete({ where: { id: input.id } });
    }),
});
