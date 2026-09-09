import Link from "next/link";

export default function CategoryChips({
	categories,
	activeSlug,
}: {
	categories: { slug: string; name: string }[];
	activeSlug?: string;
}) {
	return (
		<div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
			<Link
				href="/prodavnica"
				className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
					!activeSlug
						? "bg-primary text-primary-foreground"
						: "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
				}`}
			>
				Sve
			</Link>
			{categories.map((cat) => (
				<Link
					key={cat.slug}
					href={`/kategorija/${cat.slug}`}
					className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
						activeSlug === cat.slug
							? "bg-primary text-primary-foreground"
							: "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
					}`}
				>
					{cat.name}
				</Link>
			))}
		</div>
	);
}
