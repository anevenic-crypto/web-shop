import { db } from "@web-shop/db";
import { category, product } from "@web-shop/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import AmbientBackground from "@/components/ambient-background";
import CategoryChips from "@/components/category-chips";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import { getCategoryTilesWithImages } from "@/lib/category-tiles";

const SORTS = {
	"price-asc": asc(product.priceRsd),
	"price-desc": desc(product.priceRsd),
	newest: desc(product.createdAt),
} as const;

export default async function KategorijaPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ brand?: string; sort?: string }>;
}) {
	const { slug } = await params;
	const { brand, sort } = await searchParams;

	const [categories, activeCategory] = await Promise.all([
		getCategoryTilesWithImages(),
		db.query.category.findFirst({ where: eq(category.slug, slug) }),
	]);

	if (!activeCategory) {
		notFound();
	}

	const [products, brandRows] = await Promise.all([
		db.query.product.findMany({
			where: and(
				eq(product.categoryId, activeCategory.id),
				eq(product.isPublished, true),
				brand ? eq(product.brand, brand) : undefined,
			),
			orderBy: SORTS[sort as keyof typeof SORTS] ?? SORTS.newest,
			with: {
				images: {
					orderBy: (image, { asc: sortAsc }) => sortAsc(image.position),
				},
			},
		}),
		db.query.product.findMany({
			where: and(
				eq(product.categoryId, activeCategory.id),
				eq(product.isPublished, true),
			),
			columns: { brand: true },
		}),
	]);

	const brands = [
		...new Set(
			brandRows.map((p) => p.brand).filter((b): b is string => Boolean(b)),
		),
	].sort((a, b) => a.localeCompare(b));

	return (
		<div className="relative isolate overflow-hidden">
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

				<div className="mb-6">
					<CategoryChips
						categories={categories}
						activeSlug={activeCategory.slug}
					/>
				</div>

				<div className="mb-10">
					<Suspense fallback={null}>
						<ProductFilters brands={brands} />
					</Suspense>
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
