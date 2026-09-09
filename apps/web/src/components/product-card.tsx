import Link from "next/link";

export type PublicProduct = {
	slug: string;
	name: string;
	brand: string | null;
	priceRsd: number;
	stock: number;
	image?: string;
};

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

export default function ProductCard({
	product,
	style,
}: {
	product: PublicProduct;
	style?: React.CSSProperties;
}) {
	return (
		<Link
			href={`/proizvod/${product.slug}`}
			style={style}
			className="group fade-in slide-in-from-bottom-3 animate-in overflow-hidden rounded-3xl border border-border bg-card fill-mode-backwards shadow-[0_2px_10px_-4px_oklch(0.64_0.11_12_/_0.16)] duration-700 hover:shadow-[0_16px_32px_-10px_oklch(0.64_0.11_12_/_0.3)]"
		>
			<div className="aspect-square w-full overflow-hidden bg-muted">
				{product.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={product.image}
						alt={product.name}
						className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground text-xs">
						Bez slike
					</div>
				)}
			</div>
			<div className="flex flex-col gap-1 p-4">
				<p className="line-clamp-1 text-muted-foreground text-xs uppercase tracking-wide">
					{product.brand ?? ""}
				</p>
				<p className="line-clamp-2 font-serif text-base leading-snug">
					{product.name}
				</p>
				<p className="mt-1 font-semibold text-primary">
					{formatRsd(product.priceRsd)}
				</p>
				{product.stock <= 0 && (
					<p className="text-destructive text-xs">Nema na stanju</p>
				)}
			</div>
		</Link>
	);
}
