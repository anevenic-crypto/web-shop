import { db } from "@web-shop/db";
import { product } from "@web-shop/db/schema";
import { eq } from "drizzle-orm";

export async function getCategoryTilesWithImages() {
	const [categories, products] = await Promise.all([
		db.query.category.findMany({ orderBy: (cat, { asc }) => asc(cat.name) }),
		db.query.product.findMany({
			where: eq(product.isPublished, true),
			with: { images: { orderBy: (image, { asc }) => asc(image.position) } },
		}),
	]);

	return categories.map((cat) => {
		const withImage = products.find(
			(p) => p.categoryId === cat.id && p.images[0],
		);
		return { slug: cat.slug, name: cat.name, image: withImage?.images[0]?.url };
	});
}
