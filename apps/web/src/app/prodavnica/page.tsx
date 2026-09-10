import { db } from "@web-shop/db";
import { product } from "@web-shop/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import Link from "next/link";

import AmbientBackground from "@/components/ambient-background";
import CategoryChips from "@/components/category-chips";
import ProductCard from "@/components/product-card";
import { getCategoryTilesWithImages } from "@/lib/category-tiles";

export default async function ProdavnicaPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const { q } = await searchParams;

	const [categories, products] = await Promise.all([
		getCategoryTilesWithImages(),
		db.query.product.findMany({
			where: q
				? and(
						eq(product.isPublished, true),
						or(ilike(product.name, `%${q}%`), ilike(product.brand, `%${q}%`)),
					)
				: eq(product.isPublished, true),
			orderBy: desc(product.createdAt),
			with: { images: { orderBy: (image, { asc }) => asc(image.position) } },
		}),
	]);

	return (
		<div className="relative isolate overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="mb-8 text-center sm:text-left">
					<p className="text-primary text-sm uppercase tracking-[0.2em]">
						Kolekcija
					</p>
					<h1 className="mt-2 font-serif text-4xl">Cela prodavnica</h1>
					<p className="mt-2 text-muted-foreground">
						{q ? (
							<>
								{products.length}{" "}
								{products.length === 1 ? "rezultat" : "rezultata"} za "{q}" —{" "}
								<Link
									href="/prodavnica"
									className="text-primary hover:underline"
								>
									obriši pretragu
								</Link>
							</>
						) : (
							<>
								{products.length}{" "}
								{products.length === 1 ? "proizvod" : "proizvoda"} spremno da
								vas oduševi.
							</>
						)}
					</p>
				</div>

				<div className="mb-10">
					<CategoryChips categories={categories} />
				</div>

				{products.length === 0 ? (
					<p className="text-muted-foreground">
						{q
							? "Nema proizvoda koji odgovaraju pretrazi."
							: "Trenutno nema dostupnih proizvoda."}
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
