import { TRPCError } from "@trpc/server";
import { db } from "@web-shop/db";
import { promo } from "@web-shop/db/schema";
import { removeObject } from "@web-shop/storage";
import { asc, eq, max } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure, router } from "../index";

const promoInput = {
	title: z.string().min(1).max(200),
	body: z.string().min(1).max(2000),
	isPublished: z.boolean(),
};

export const promosRouter = router({
	list: adminProcedure.query(async () => {
		return db.query.promo.findMany({ orderBy: asc(promo.position) });
	}),

	listPublished: publicProcedure.query(async () => {
		return db.query.promo.findMany({
			where: eq(promo.isPublished, true),
			orderBy: asc(promo.position),
		});
	}),

	create: adminProcedure
		.input(z.object(promoInput))
		.mutation(async ({ input }) => {
			const [{ value: maxPosition }] = await db
				.select({ value: max(promo.position) })
				.from(promo);
			const [created] = await db
				.insert(promo)
				.values({
					title: input.title,
					body: input.body,
					isPublished: input.isPublished,
					position: (maxPosition ?? -1) + 1,
				})
				.returning();
			return created;
		}),

	update: adminProcedure
		.input(z.object({ id: z.string(), ...promoInput }))
		.mutation(async ({ input }) => {
			const existing = await db.query.promo.findFirst({
				where: eq(promo.id, input.id),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Promo not found" });
			}
			const [updated] = await db
				.update(promo)
				.set({
					title: input.title,
					body: input.body,
					isPublished: input.isPublished,
				})
				.where(eq(promo.id, input.id))
				.returning();
			return updated;
		}),

	setImage: adminProcedure
		.input(
			z.object({
				id: z.string(),
				imageKey: z.string().nullable(),
				imageUrl: z.string().nullable(),
			}),
		)
		.mutation(async ({ input }) => {
			const existing = await db.query.promo.findFirst({
				where: eq(promo.id, input.id),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Promo not found" });
			}
			if (existing.imageKey) {
				await removeObject(existing.imageKey);
			}
			const [updated] = await db
				.update(promo)
				.set({ imageKey: input.imageKey, imageUrl: input.imageUrl })
				.where(eq(promo.id, input.id))
				.returning();
			return updated;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existing = await db.query.promo.findFirst({
				where: eq(promo.id, input.id),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Promo not found" });
			}
			if (existing.imageKey) {
				await removeObject(existing.imageKey);
			}
			await db.delete(promo).where(eq(promo.id, input.id));
			return { id: input.id };
		}),
});
