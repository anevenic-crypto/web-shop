import { TRPCError } from "@trpc/server";
import { db } from "@web-shop/db";
import { product, productImage, productVariant } from "@web-shop/db/schema";
import { removeObject } from "@web-shop/storage";
import { asc, desc, eq, max } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";
import { uniqueSlug } from "../lib/slug";

const productInput = {
	name: z.string().min(1).max(300),
	description: z.string().max(5000).optional(),
	brand: z.string().max(200).optional(),
	priceRsd: z.number().int().nonnegative(),
	stock: z.number().int().nonnegative(),
	categoryId: z.string().nullable().optional(),
	isPublished: z.boolean(),
};

export const productsRouter = router({
	list: adminProcedure
		.input(z.object({ categoryId: z.string().optional() }).optional())
		.query(async ({ input }) => {
			return db.query.product.findMany({
				where: input?.categoryId
					? eq(product.categoryId, input.categoryId)
					: undefined,
				orderBy: desc(product.createdAt),
				with: {
					category: true,
					images: { orderBy: asc(productImage.position) },
				},
			});
		}),

	getById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const found = await db.query.product.findFirst({
				where: eq(product.id, input.id),
				with: {
					category: true,
					images: { orderBy: asc(productImage.position) },
					variants: { orderBy: asc(productVariant.position) },
				},
			});
			if (!found) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Product not found",
				});
			}
			return found;
		}),

	create: adminProcedure
		.input(z.object(productInput))
		.mutation(async ({ input }) => {
			const slug = await uniqueSlug(input.name, async (candidate) => {
				const existing = await db.query.product.findFirst({
					where: eq(product.slug, candidate),
				});
				return !!existing;
			});
			const [created] = await db
				.insert(product)
				.values({
					name: input.name,
					slug,
					description: input.description || null,
					brand: input.brand || null,
					priceRsd: input.priceRsd,
					stock: input.stock,
					categoryId: input.categoryId || null,
					isPublished: input.isPublished,
				})
				.returning();
			return created;
		}),

	update: adminProcedure
		.input(z.object({ id: z.string(), ...productInput }))
		.mutation(async ({ input }) => {
			const { id, ...values } = input;
			const existing = await db.query.product.findFirst({
				where: eq(product.id, id),
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Product not found",
				});
			}
			const [updated] = await db
				.update(product)
				.set({
					name: values.name,
					description: values.description || null,
					brand: values.brand || null,
					priceRsd: values.priceRsd,
					stock: values.stock,
					categoryId: values.categoryId || null,
					isPublished: values.isPublished,
				})
				.where(eq(product.id, id))
				.returning();
			return updated;
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existing = await db.query.product.findFirst({
				where: eq(product.id, input.id),
				with: { images: true },
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Product not found",
				});
			}
			await Promise.all(
				existing.images.map((image) => removeObject(image.key)),
			);
			await db.delete(product).where(eq(product.id, input.id));
			return { id: input.id };
		}),

	addImage: adminProcedure
		.input(
			z.object({ productId: z.string(), key: z.string(), url: z.string() }),
		)
		.mutation(async ({ input }) => {
			const [{ value: maxPosition }] = await db
				.select({ value: max(productImage.position) })
				.from(productImage)
				.where(eq(productImage.productId, input.productId));
			const [created] = await db
				.insert(productImage)
				.values({
					productId: input.productId,
					key: input.key,
					url: input.url,
					position: (maxPosition ?? -1) + 1,
				})
				.returning();
			return created;
		}),

	removeImage: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const existing = await db.query.productImage.findFirst({
				where: eq(productImage.id, input.id),
			});
			if (!existing) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Image not found" });
			}
			await removeObject(existing.key);
			await db.delete(productImage).where(eq(productImage.id, input.id));
			return { id: input.id };
		}),

	addVariant: adminProcedure
		.input(
			z.object({
				productId: z.string(),
				name: z.string().min(1).max(100),
				colorHex: z.string().max(20).optional(),
				stock: z.number().int().nonnegative(),
			}),
		)
		.mutation(async ({ input }) => {
			const [{ value: maxPosition }] = await db
				.select({ value: max(productVariant.position) })
				.from(productVariant)
				.where(eq(productVariant.productId, input.productId));
			const [created] = await db
				.insert(productVariant)
				.values({
					productId: input.productId,
					name: input.name,
					colorHex: input.colorHex || null,
					stock: input.stock,
					position: (maxPosition ?? -1) + 1,
				})
				.returning();
			return created;
		}),

	updateVariant: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).max(100),
				colorHex: z.string().max(20).optional(),
				stock: z.number().int().nonnegative(),
			}),
		)
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(productVariant)
				.set({
					name: input.name,
					colorHex: input.colorHex || null,
					stock: input.stock,
				})
				.where(eq(productVariant.id, input.id))
				.returning();
			if (!updated) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Variant not found",
				});
			}
			return updated;
		}),

	removeVariant: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await db.delete(productVariant).where(eq(productVariant.id, input.id));
			return { id: input.id };
		}),
});
