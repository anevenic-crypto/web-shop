import { db } from "@web-shop/db";
import { contactMessage } from "@web-shop/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure, router } from "../index";

export const contactRouter = router({
	send: publicProcedure
		.input(
			z.object({
				name: z.string().min(1).max(200),
				email: z.email(),
				message: z.string().min(1).max(2000),
			}),
		)
		.mutation(async ({ input }) => {
			const [created] = await db
				.insert(contactMessage)
				.values(input)
				.returning();
			return created;
		}),

	list: adminProcedure.query(async () => {
		return db.query.contactMessage.findMany({
			orderBy: desc(contactMessage.createdAt),
		});
	}),

	markRead: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await db
				.update(contactMessage)
				.set({ isRead: true })
				.where(eq(contactMessage.id, input.id));
			return { id: input.id };
		}),
});
