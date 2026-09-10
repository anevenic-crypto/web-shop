import { TRPCError } from "@trpc/server";
import { db } from "@web-shop/db";
import { order, orderItem } from "@web-shop/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure, router } from "../index";
import { notifyNewOrder } from "../lib/notify-order";

const orderItemInput = z.object({
	productId: z.string().optional(),
	name: z.string().min(1),
	variantName: z.string().optional(),
	priceRsd: z.number().int().nonnegative(),
	quantity: z.number().int().positive(),
});

export const ordersRouter = router({
	create: publicProcedure
		.input(
			z.object({
				customerName: z.string().min(1).max(200),
				phone: z.string().min(3).max(50),
				address: z.string().min(1).max(500),
				note: z.string().max(1000).optional(),
				items: z.array(orderItemInput).min(1),
			}),
		)
		.mutation(async ({ input }) => {
			const totalRsd = input.items.reduce(
				(sum, item) => sum + item.priceRsd * item.quantity,
				0,
			);

			const [created] = await db
				.insert(order)
				.values({
					customerName: input.customerName,
					phone: input.phone,
					address: input.address,
					note: input.note || null,
					totalRsd,
				})
				.returning();

			await db.insert(orderItem).values(
				input.items.map((item) => ({
					orderId: created.id,
					productId: item.productId || null,
					name: item.name,
					variantName: item.variantName || null,
					priceRsd: item.priceRsd,
					quantity: item.quantity,
				})),
			);

			await notifyNewOrder({
				id: created.id,
				customerName: created.customerName,
				phone: created.phone,
				address: created.address,
				note: created.note,
				totalRsd: created.totalRsd,
				items: input.items.map((item) => ({
					...item,
					variantName: item.variantName ?? null,
				})),
			});

			return { id: created.id };
		}),

	list: adminProcedure.query(async () => {
		return db.query.order.findMany({
			orderBy: desc(order.createdAt),
			with: { items: true },
		});
	}),

	updateStatus: adminProcedure
		.input(z.object({ id: z.string(), status: z.string().min(1).max(30) }))
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(order)
				.set({ status: input.status })
				.where(eq(order.id, input.id))
				.returning();
			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}
			return updated;
		}),
});
