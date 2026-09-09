import { TRPCError } from "@trpc/server";
import { db } from "@web-shop/db";
import { category, product } from "@web-shop/db/schema";
import { count, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure, router } from "../index";
import { uniqueSlug } from "../lib/slug";

export const categoriesRouter = router({
	listPublic: publicProcedure.query(async () => {
		return db.query.category.findMany({
			columns: { id: true, name: true, slug: true },
			orderBy: (cat, { asc }) => asc(cat.name),
		});
	}),

	list: adminProcedure.query(async () => {
		const rows = await db
			.select({
				id: category.id,
				name: category.name,
				slug: category.slug,
				createdAt: category.createdAt,
				productCount: count(product.id),
			})
			.from(category)
			.leftJoin(product, eq(product.categoryId, category.id))
			.groupBy(category.id)
			.orderBy(category.name);
		return rows;
	}),

	create: adminProcedure
		.input(z.object({ name: z.string().min(1).max(200) }))
		.mutation(async ({ input }) => {
			const slug = await uniqueSlug(input.name, async (candidate) => {
				const existing = await db.query.category.findFirst({
					where: eq(category.slug, candidate),
				});
				return !!existing;
			});
			const [created] = await db
				.insert(category)
				.values({ name: input.name, slug })
				.returning();
			return created;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existing = await db.query.category.findFirst({
				where: eq(category.id, input.id),
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Category not found",
				});
			}
			await db.delete(category).where(eq(category.id, input.id));
			return { id: input.id };
		}),
});
