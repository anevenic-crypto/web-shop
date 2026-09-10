import { db } from "@web-shop/db";
import { product } from "@web-shop/db/schema";
import { and, eq, gt, ne, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import AmbientBackground from "@/components/ambient-background";
import ProductCard from "@/components/product-card";

import ProductView from "./product-view";

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

const getProduct = cache(async (slug: string) => {
	return db.query.product.findFirst({
		where: and(eq(product.slug, slug), eq(product.isPublished, true)),
		with: {
			category: true,
			images: { orderBy: (image, { asc }) => asc(image.position) },
			variants: { orderBy: (variant, { asc }) => asc(variant.position) },
		},
	});
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const found = await getProduct(slug);

	if (!found) {
		return { title: "Proizvod nije pronađen — Vellure" };
	}

	const title = `${found.name} — Vellure`;
	const description = found.description
		? found.description
		: `${found.brand ? `${found.brand} — ` : ""}${formatRsd(found.priceRsd)}. Pogledajte na Vellure, prestižnoj kozmetici za trenutke kad želite da izgledate nezaboravno.`;
	const image = found.images[0]?.url;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: image ? [{ url: image, alt: found.name }] : undefined,
		},
	};
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const found = await getProduct(slug);

	if (!found) {
		notFound();
	}

	const related = found.categoryId
		? await db.query.product.findMany({
				where: and(
					eq(product.categoryId, found.categoryId),
					eq(product.isPublished, true),
					gt(product.stock, 0),
					ne(product.id, found.id),
				),
				orderBy: sql`random()`,
				limit: 4,
				with: { images: { orderBy: (image, { asc }) => asc(image.position) } },
			})
		: [];

	return (
		<div className="relative isolate overflow-hidden">
			<AmbientBackground />
			<ProductView product={found} />

			{related.length > 0 && (
				<div className="mx-auto max-w-4xl px-6 pb-24">
					<h2 className="mb-6 font-serif text-2xl">Možda vam se dopadne</h2>
					<div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
						{related.map((p, i) => (
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
		</div>
	);
}
