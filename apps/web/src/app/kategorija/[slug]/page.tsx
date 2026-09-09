import { db } from "@web-shop/db";
import { category, product } from "@web-shop/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import AmbientBackground from "@/components/ambient-background";
import CategoryChips from "@/components/category-chips";
import ProductCard from "@/components/product-card";
import { getCategoryTilesWithImages } from "@/lib/category-tiles";

export default async function KategorijaPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const [categories, activeCategory] = await Promise.all([
		getCategoryTilesWithImages(),
		db.query.category.findFirst({ where: eq(category.slug, slug) }),
	]);

	if (!activeCategory) {
		notFound();
	}

	const products = await db.query.product.findMany({
		where: and(
			eq(product.categoryId, activeCategory.id),
			eq(product.isPublished, true),
		),
		orderBy: desc(product.createdAt),
		with: { images: { orderBy: (image, { asc }) => asc(image.position) } },
	});

	return (
		<div className="relative overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="mb-8 text-center sm:text-left">
					<p className="text-primary text-sm uppercase tracking-[0.2em]">
						Kategorija
					</p>
					<h1 className="mt-2 font-serif text-4xl">{activeCategory.name}</h1>
					<p className="mt-2 text-muted-foreground">
						{products.length} {products.length === 1 ? "proizvod" : "proizvoda"}{" "}
						u ovoj kategoriji.
					</p>
				</div>

				<div className="mb-10">
					<CategoryChips
						categories={categories}
						activeSlug={activeCategory.slug}
					/>
				</div>

				{products.length === 0 ? (
					<p className="text-muted-foreground">
						Trenutno nema proizvoda u ovoj kategoriji.
					</p>
				) : (
					<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
						{products.map((p, i) => (
							<ProductCard
								key={p.id}
								product={{
									slug: p.slug,
									name: p.name,
									brand: p.brand,
									priceRsd: p.priceRsd,
									stock: p.stock,
									image: p.images[0]?.url,
								}}
								style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
