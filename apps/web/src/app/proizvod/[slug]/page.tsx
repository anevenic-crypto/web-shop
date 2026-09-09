import { db } from "@web-shop/db";
import { product } from "@web-shop/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import ProductView from "./product-view";

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const found = await db.query.product.findFirst({
		where: and(eq(product.slug, slug), eq(product.isPublished, true)),
		with: {
			category: true,
			images: { orderBy: (image, { asc }) => asc(image.position) },
			variants: { orderBy: (variant, { asc }) => asc(variant.position) },
		},
	});

	if (!found) {
		notFound();
	}

	return <ProductView product={found} />;
}
