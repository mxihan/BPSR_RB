import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const applicationRouter = createTRPCRouter({
  // Apply to a team slot
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        slotId: z.string(),
        profileId: z.string(),
        message: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify profile ownership
      const profile = await ctx.db.playerProfile.findUnique({
        where: { id: input.profileId },
      });
      if (profile?.userId !== ctx.session.user.id) {
        throw new Error("Profile not found or not owned by you");
      }

      // Verify slot exists and is not filled
      const slot = await ctx.db.roleSlot.findUnique({
        where: { id: input.slotId },
        include: { team: true },
      });
      if (!slot) throw new Error("Slot not found");
      if (slot.isFilled) throw new Error("Slot already filled");
      if (slot.teamId !== input.teamId) throw new Error("Slot does not belong to this team");
      if (slot.team.status !== "OPEN") throw new Error("Team is not open for applications");

      // Check for duplicate application
      const existing = await ctx.db.application.findUnique({
        where: {
          teamId_slotId_profileId: {
            teamId: input.teamId,
            slotId: input.slotId,
            profileId: input.profileId,
          },
        },
      });
      if (existing) throw new Error("Already applied to this slot");

      const application = await ctx.db.application.create({
        data: {
          teamId: input.teamId,
          slotId: input.slotId,
          profileId: input.profileId,
          message: input.message,
        },
      });

      // Notify team leader
      await ctx.db.notification.create({
        data: {
          userId: slot.team.leaderId,
          type: "application_received",
          title: "New Application",
          message: `${profile.displayName} applied to your team: ${slot.team.title}`,
          link: `/teams/${input.teamId}`,
        },
      });

      return application;
    }),

  // Withdraw application
  withdraw: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.application.findUnique({
        where: { id: input.id },
      });
      if (!application) throw new Error("Application not found");

      // Verify ownership via profile
      const profile = await ctx.db.playerProfile.findUnique({
        where: { id: application.profileId },
      });
      if (profile?.userId !== ctx.session.user.id) {
        throw new Error("Not your application");
      }

      if (application.status !== "PENDING") {
        throw new Error("Can only withdraw pending applications");
      }

      return ctx.db.application.update({
        where: { id: input.id },
        data: { status: "WITHDRAWN" },
      });
    }),

  // Approve application (leader/admin only)
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reviewNote: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.application.findUnique({
        where: { id: input.id },
        include: { slot: { include: { team: true } }, profile: true },
      });
      if (!application) throw new Error("Application not found");

      // Verify leader/admin
      if (
        application.slot.team.leaderId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized");
      }

      if (application.status !== "PENDING") {
        throw new Error("Application is not pending");
      }

      if (application.slot.isFilled) {
        throw new Error("Slot already filled");
      }

      // Update application
      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data: {
          status: "APPROVED",
          reviewNote: input.reviewNote,
        },
      });

      // Fill the slot
      await ctx.db.roleSlot.update({
        where: { id: application.slotId },
        data: {
          isFilled: true,
          filledById: application.profileId,
        },
      });

      // Create team member
      await ctx.db.teamMember.create({
        data: {
          teamId: application.teamId,
          profileId: application.profileId,
          slotId: application.slotId,
          role: "Member",
        },
      });

      // Reject other pending applications for the same slot
      await ctx.db.application.updateMany({
        where: {
          slotId: application.slotId,
          status: "PENDING",
          id: { not: input.id },
        },
        data: {
          status: "REJECTED",
          reviewNote: "Slot filled by another applicant",
        },
      });

      // Notify applicant
      await ctx.db.notification.create({
        data: {
          userId: application.profile.userId,
          type: "application_status",
          title: "Application Approved",
          message: `You've been accepted to: ${application.slot.team.title}`,
          link: `/teams/${application.teamId}`,
        },
      });

      return updated;
    }),

  // Reject application (leader/admin only)
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reviewNote: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.db.application.findUnique({
        where: { id: input.id },
        include: { slot: { include: { team: true } }, profile: true },
      });
      if (!application) throw new Error("Application not found");

      if (
        application.slot.team.leaderId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized");
      }

      const updated = await ctx.db.application.update({
        where: { id: input.id },
        data: {
          status: "REJECTED",
          reviewNote: input.reviewNote,
        },
      });

      // Notify applicant
      await ctx.db.notification.create({
        data: {
          userId: application.profile.userId,
          type: "application_status",
          title: "Application Rejected",
          message: `Your application to "${application.slot.team.title}" was declined.`,
          link: `/my-applications`,
        },
      });

      return updated;
    }),

  // List applications for a team (leader/admin)
  listByTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "WITHDRAWN"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
      });
      if (!team) throw new Error("Team not found");
      if (
        team.leaderId !== ctx.session.user.id &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new Error("Not authorized");
      }

      return ctx.db.application.findMany({
        where: {
          teamId: input.teamId,
          ...(input.status && { status: input.status }),
        },
        include: {
          profile: {
            include: {
              primaryClass: true,
              primarySpec: true,
              user: { select: { name: true, image: true } },
            },
          },
          slot: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // List current user's applications
  listByUser: protectedProcedure.query(async ({ ctx }) => {
    const profiles = await ctx.db.playerProfile.findMany({
      where: { userId: ctx.session.user.id },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    return ctx.db.application.findMany({
      where: { profileId: { in: profileIds } },
      include: {
        team: {
          include: {
            content: true,
            difficulty: true,
            leader: { select: { name: true, image: true } },
          },
        },
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
