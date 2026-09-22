import { db } from "@web-shop/db";
import { chatConversation, chatMessage } from "@web-shop/db/schema";
import { asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const chatsRouter = router({
	stats: adminProcedure.query(async () => {
		const danas = new Date();
		danas.setHours(0, 0, 0, 0);
		const [ukupno] = await db.select({ n: count() }).from(chatConversation);
		const [danasnji] = await db
			.select({ n: count() })
			.from(chatConversation)
			.where(gte(chatConversation.createdAt, danas));
		const [poruke] = await db
			.select({ n: sql<number>`coalesce(sum(${chatConversation.messageCount}), 0)` })
			.from(chatConversation);
		return {
			ukupnoRazgovora: ukupno?.n ?? 0,
			danas: danasnji?.n ?? 0,
			ukupnoPoruka: Number(poruke?.n ?? 0),
		};
	}),

	list: adminProcedure
		.input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
		.query(async ({ input }) => {
			return db.query.chatConversation.findMany({
				orderBy: desc(chatConversation.updatedAt),
				limit: input?.limit ?? 50,
			});
		}),

	get: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return db.query.chatMessage.findMany({
				where: eq(chatMessage.conversationId, input.id),
				orderBy: asc(chatMessage.createdAt),
			});
		}),

	remove: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			await db.delete(chatConversation).where(eq(chatConversation.id, input.id));
			return { id: input.id };
		}),
});
