import { protectedProcedure, publicProcedure, router } from "../index";
import { categoriesRouter } from "./categories";
import { productsRouter } from "./products";
import { promosRouter } from "./promos";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	categories: categoriesRouter,
	products: productsRouter,
	promos: promosRouter,
});
export type AppRouter = typeof appRouter;
