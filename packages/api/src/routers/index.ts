import { publicProcedure, router } from "../index";
import { categoriesRouter } from "./categories";
import { contactRouter } from "./contact";
import { ordersRouter } from "./orders";
import { productsRouter } from "./products";
import { promosRouter } from "./promos";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	categories: categoriesRouter,
	products: productsRouter,
	promos: promosRouter,
	orders: ordersRouter,
	contact: contactRouter,
});
export type AppRouter = typeof appRouter;
