import Link from "next/link";

export type CategoryTile = { slug: string; name: string; image?: string };

export default function CategoryChips({
	categories,
	activeSlug,
}: {
	categories: CategoryTile[];
	activeSlug?: string;
}) {
	return (
		<div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 md:grid-cols-6 lg:grid-cols-8">
			<Link
				href="/prodavnica"
				className={`group relative flex aspect-square w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl font-serif text-sm transition-all sm:w-auto ${
					!activeSlug
						? "bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
						: "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
				}`}
			>
				Sve
			</Link>
			{categories.map((cat) => (
				<Link
					key={cat.slug}
					href={`/kategorija/${cat.slug}`}
					className={`group relative aspect-square w-28 shrink-0 overflow-hidden rounded-3xl transition-all sm:w-auto ${
						activeSlug === cat.slug
							? "ring-2 ring-primary ring-offset-2 ring-offset-background"
							: ""
					}`}
				>
					{cat.image ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={cat.image}
							alt={cat.name}
							className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					) : (
						<div className="size-full bg-muted" />
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
					<p className="absolute inset-x-2 bottom-2 line-clamp-2 font-serif text-white text-xs sm:text-sm">
						{cat.name}
					</p>
				</Link>
			))}
		</div>
	);
}
