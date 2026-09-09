import { publicProcedure, router } from "../index";
import { categoriesRouter } from "./categories";
import { productsRouter } from "./products";
import { promosRouter } from "./promos";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	categories: categoriesRouter,
	products: productsRouter,
	promos: promosRouter,
});
export type AppRouter = typeof appRouter;
