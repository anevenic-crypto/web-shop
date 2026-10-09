import { TRPCError } from "@trpc/server";
import { db } from "@web-shop/db";
import { order, orderItem } from "@web-shop/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure, router } from "../index";
import { notifyNewOrder, sendOrderConfirmation } from "../lib/notify-order";
import { shippingFor } from "../lib/shipping";

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
				email: z.email().max(200).optional().or(z.literal("")),
				items: z.array(orderItemInput).min(1),
			}),
		)
		.mutation(async ({ input }) => {
			const subtotalRsd = input.items.reduce(
				(sum, item) => sum + item.priceRsd * item.quantity,
				0,
			);
			const shippingRsd = shippingFor(subtotalRsd);
			const totalRsd = subtotalRsd + shippingRsd;
			const email = input.email?.trim() || null;

			const [created] = await db
				.insert(order)
				.values({
					customerName: input.customerName,
					phone: input.phone,
					address: input.address,
					note: input.note || null,
					email,
					shippingRsd,
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

			const mailData = {
				id: created.id,
				customerName: created.customerName,
				phone: created.phone,
				address: created.address,
				note: created.note,
				email,
				shippingRsd,
				totalRsd: created.totalRsd,
				items: input.items.map((item) => ({
					...item,
					variantName: item.variantName ?? null,
				})),
			};
			// mejlovi ne smeju da obore porudzbinu — salju se paralelno, greske se samo loguju
			await Promise.all([notifyNewOrder(mailData), sendOrderConfirmation(mailData)]);

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

	remove: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const [deleted] = await db
				.delete(order)
				.where(eq(order.id, input.id))
				.returning({ id: order.id });
			if (!deleted) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}
			return deleted;
		}),
});
