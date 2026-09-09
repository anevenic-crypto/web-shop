import { db } from "@web-shop/db";
import { product, promo } from "@web-shop/db/schema";
import { Button } from "@web-shop/ui/components/button";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";

import ProductCard from "@/components/product-card";

export default async function Home() {
	const [promos, categories, featuredProducts] = await Promise.all([
		db.query.promo.findMany({
			where: eq(promo.isPublished, true),
			orderBy: asc(promo.position),
		}),
		db.query.category.findMany({
			orderBy: (cat, { asc: sortAsc }) => sortAsc(cat.name),
		}),
		db.query.product.findMany({
			where: eq(product.isPublished, true),
			orderBy: desc(product.createdAt),
			limit: 8,
			with: {
				images: {
					orderBy: (image, { asc: sortAsc }) => sortAsc(image.position),
				},
			},
		}),
	]);

	const allProductsForTiles = await db.query.product.findMany({
		where: eq(product.isPublished, true),
		with: {
			images: { orderBy: (image, { asc: sortAsc }) => sortAsc(image.position) },
		},
	});

	const categoryTiles = categories
		.map((cat) => {
			const withImage = allProductsForTiles.find(
				(p) => p.categoryId === cat.id && p.images[0],
			);
			return { ...cat, image: withImage?.images[0]?.url };
		})
		.filter((cat) => cat.image);

	const heroImages = featuredProducts
		.map((p) => p.images[0]?.url)
		.filter(Boolean);

	return (
		<div className="relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.93_0.03_14)_0%,transparent_70%)]"
			/>
			<div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
				<div className="flex flex-col items-center text-center md:items-start md:text-left">
					<p className="fade-in slide-in-from-bottom-2 animate-in text-primary text-sm uppercase tracking-[0.2em] duration-700">
						Prestižna kozmetika
					</p>
					<h1 className="fade-in slide-in-from-bottom-3 mt-4 animate-in text-balance font-serif text-4xl duration-700 sm:text-6xl">
						Šminka koju pamtite,
						<br />
						ne samo nosite
					</h1>
					<p className="fade-in slide-in-from-bottom-3 mt-6 max-w-md animate-in text-pretty text-muted-foreground delay-150 duration-700">
						Pažljivo odabrani komadi svetskih luksuznih kuća — od ruževa do
						paleta senki — za trenutke kad želite da izgledate nezaboravno.
					</p>
					<Link
						href="/prodavnica"
						className="fade-in slide-in-from-bottom-3 mt-8 animate-in delay-300 duration-700"
					>
						<Button size="lg" className="rounded-full px-8">
							Pogledaj celu kolekciju
						</Button>
					</Link>
				</div>

				{heroImages.length > 0 && (
					<div className="fade-in zoom-in-95 relative mx-auto aspect-square w-full max-w-sm animate-in delay-200 duration-700">
						{heroImages[1] && (
							<div className="absolute top-6 -right-4 aspect-square w-2/3 rotate-6 overflow-hidden rounded-3xl shadow-xl ring-4 ring-background">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={heroImages[1]}
									alt=""
									className="size-full object-cover"
								/>
							</div>
						)}
						<div className="absolute inset-0 left-0 aspect-square w-2/3 -rotate-3 overflow-hidden rounded-3xl shadow-2xl ring-4 ring-background">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={heroImages[0]}
								alt=""
								className="size-full object-cover"
							/>
						</div>
					</div>
				)}
			</div>

			{categoryTiles.length > 0 && (
				<div className="mx-auto max-w-6xl px-6 pb-24">
					<h2 className="mb-8 text-center font-serif text-2xl sm:text-3xl">
						Šop po kategoriji
					</h2>
					<div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
						{categoryTiles.map((cat, i) => (
							<Link
								key={cat.id}
								href={`/kategorija/${cat.slug}`}
								style={{ animationDelay: `${i * 60}ms` }}
								className="group fade-in slide-in-from-bottom-2 relative aspect-square w-40 shrink-0 animate-in overflow-hidden rounded-3xl fill-mode-backwards duration-700 sm:w-auto"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={cat.image}
									alt={cat.name}
									className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
								<p className="absolute bottom-3 left-3 font-serif text-base text-white">
									{cat.name}
								</p>
							</Link>
						))}
					</div>
				</div>
			)}

			{featuredProducts.length > 0 && (
				<div className="mx-auto max-w-6xl px-6 pb-24">
					<div className="mb-8 flex items-end justify-between">
						<h2 className="font-serif text-2xl sm:text-3xl">
							Izdvajamo za vas
						</h2>
						<Link
							href="/prodavnica"
							className="text-primary text-sm hover:underline"
						>
							Sve proizvode →
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
						{featuredProducts.map((p, i) => (
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
								style={{ animationDelay: `${i * 60}ms` }}
							/>
						))}
					</div>
				</div>
			)}

			{promos.length > 0 && (
				<div className="mx-auto max-w-6xl px-6 pb-28">
					<h2 className="mb-8 text-center font-serif text-2xl sm:text-3xl">
						Saveti i priče
					</h2>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{promos.map((item) => (
							<article
								key={item.id}
								className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
							>
								{item.imageUrl && (
									<div className="aspect-video w-full overflow-hidden bg-muted">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={item.imageUrl}
											alt={item.title}
											className="size-full object-cover"
										/>
									</div>
								)}
								<div className="flex flex-1 flex-col gap-2 p-6">
									<h3 className="font-serif text-lg">{item.title}</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{item.body}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
