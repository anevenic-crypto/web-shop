import { db } from "@web-shop/db";
import { product, promo } from "@web-shop/db/schema";
import { env } from "@web-shop/env/server";
import { Button } from "@web-shop/ui/components/button";
import { asc, desc, eq } from "drizzle-orm";
import {
	Clock,
	FlaskConical,
	Gem,
	Leaf,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";

import ProductCard from "@/components/product-card";

const DECOR_LIPSTICK_SMEAR = `${env.MINIO_PUBLIC_URL}/${env.MINIO_BUCKET}/decor/lipstick-smear.jpg`;

const WHY_HIGH_END = [
	{
		icon: Sparkles,
		title: "Pigment koji se oseti od prvog poteza",
		text: "Kod luksuznih formula dovoljan je jedan nanos za punu, ujednačenu boju. Kod jeftinije šminke to je obično tri do četiri poteza — i dalje neujednačeno.",
	},
	{
		icon: Leaf,
		title: "Sastojci koji neguju kožu",
		text: "Vodeće kuće ulažu u formule sa hijaluronskom kiselinom, uljima i peptidima — šminka koja izgleda dobro i posle 8 sati, umesto da se osuši na licu.",
	},
	{
		icon: Clock,
		title: "Duže traje, manje trošite",
		text: "Ruž koji izdrži 16 sati i stotine nanošenja na kraju izađe jeftiniji po upotrebi od tri budžetska ruža koja menjate svaka dva meseca.",
	},
	{
		icon: FlaskConical,
		title: "Godine razvoja iza svake nijanse",
		text: "Laboratorije poznatih kuća testiraju formule i po nekoliko godina pre lansiranja — otud ta glatka tekstura koja se ne oseti kao nanesena.",
	},
	{
		icon: Gem,
		title: "Ambalaža koju čuvate, ne bacate",
		text: "Metalne futrole, stakleni flakoni, mogućnost dopune — luksuzna šminka je napravljena da stoji na toaletnom stočiću, ne u kanti za smeće.",
	},
	{
		icon: TrendingUp,
		title: "Zadržava vrednost",
		text: "Limitirane kolekcije i saradnje poznatih kuća često postanu kolekcionarski komadi — cena im posle nekoliko godina samo raste.",
	},
] as const;

const COMPARISON_ROWS = [
	{ label: "Trajanje preko dana", premium: "12–16 sati", budget: "4–6 sati" },
	{
		label: "Pigmentacija",
		premium: "Puna boja iz jednog poteza",
		budget: "3+ poteza, neujednačeno",
	},
	{
		label: "Sastojci",
		premium: "Aktivni sastojci za negu kože",
		budget: "Uglavnom punila i alkohol",
	},
	{
		label: "Ambalaža",
		premium: "Metal / staklo, može se dopuniti",
		budget: "Plastika za jednokratnu upotrebu",
	},
] as const;

const EDGE_CIRCLES = [
	{
		top: "2%",
		side: "left" as const,
		offset: "-6%",
		size: 90,
		color: "oklch(0.93 0.03 14)",
		opacity: 0.7,
	},
	{
		top: "9%",
		side: "right" as const,
		offset: "-8%",
		size: 240,
		color: "oklch(0.64 0.11 12)",
		opacity: 0.14,
	},
	{
		top: "17%",
		side: "left" as const,
		offset: "-9%",
		size: 400,
		color: "oklch(0.55 0.13 15)",
		opacity: 0.14,
	},
	{
		top: "26%",
		side: "right" as const,
		offset: "4%",
		size: 55,
		color: "oklch(0.64 0.11 12)",
		opacity: 0.45,
	},
	{
		top: "34%",
		side: "left" as const,
		offset: "1%",
		size: 150,
		color: "oklch(0.85 0.04 20)",
		opacity: 0.5,
	},
	{
		top: "43%",
		side: "right" as const,
		offset: "-6%",
		size: 320,
		color: "oklch(0.93 0.03 14)",
		opacity: 0.5,
	},
	{
		top: "53%",
		side: "left" as const,
		offset: "-6%",
		size: 100,
		color: "oklch(0.7 0.09 350)",
		opacity: 0.28,
	},
	{
		top: "63%",
		side: "right" as const,
		offset: "3%",
		size: 200,
		color: "oklch(0.64 0.11 12)",
		opacity: 0.18,
	},
	{
		top: "73%",
		side: "left" as const,
		offset: "-4%",
		size: 70,
		color: "oklch(0.62 0.1 30)",
		opacity: 0.35,
	},
	{
		top: "83%",
		side: "right" as const,
		offset: "-7%",
		size: 380,
		color: "oklch(0.55 0.13 15)",
		opacity: 0.1,
	},
	{
		top: "93%",
		side: "left" as const,
		offset: "5%",
		size: 130,
		color: "oklch(0.93 0.03 14)",
		opacity: 0.6,
	},
] as const;

export default async function Home() {
	const [promos, featuredProducts] = await Promise.all([
		db.query.promo.findMany({
			where: eq(promo.isPublished, true),
			orderBy: asc(promo.position),
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

	const heroImages = featuredProducts
		.map((p) => p.images[0]?.url)
		.filter(Boolean);

	return (
		<div className="relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
			>
				{EDGE_CIRCLES.map((circle) => (
					<div
						key={`${circle.top}-${circle.side}`}
						className="absolute rounded-full blur-3xl"
						style={{
							top: circle.top,
							[circle.side]: circle.offset,
							width: circle.size,
							height: circle.size,
							backgroundColor: circle.color,
							opacity: circle.opacity,
						}}
					/>
				))}
			</div>

			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] overflow-hidden"
			>
				<div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.93_0.03_14)_0%,transparent_70%)]" />
				<div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-primary/25 blur-3xl" />
				<div className="absolute top-24 -right-20 size-[380px] rounded-full bg-[oklch(0.62_0.1_30)]/20 blur-3xl" />
				<div className="absolute top-[420px] left-1/4 size-[460px] rounded-full bg-accent/40 blur-3xl" />
				<div
					aria-hidden
					className="absolute inset-0 opacity-[0.035]"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
					}}
				/>
			</div>

			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={DECOR_LIPSTICK_SMEAR}
				alt=""
				className="pointer-events-none absolute top-0 right-0 w-28 rotate-6 mix-blend-multiply sm:w-40 dark:hidden"
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
					<div className="fade-in zoom-in-95 relative mx-auto mt-10 aspect-square w-full max-w-sm animate-in delay-200 duration-700 md:mt-20 md:mr-auto md:ml-0">
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

			<div className="mx-auto max-w-6xl px-6 pb-24">
				<div className="mb-10 text-center">
					<p className="text-primary text-sm uppercase tracking-[0.2em]">
						Vredi li viša cena
					</p>
					<h2 className="mt-2 font-serif text-2xl sm:text-3xl">
						Zašto high-end šminka?
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{WHY_HIGH_END.map((item, i) => (
						<div
							key={item.title}
							style={{ animationDelay: `${i * 60}ms` }}
							className="fade-in slide-in-from-bottom-2 animate-in rounded-3xl border border-border bg-card fill-mode-backwards p-6 shadow-[0_2px_10px_-4px_oklch(0.64_0.11_12_/_0.14)] duration-700"
						>
							<item.icon className="size-6 text-primary" />
							<h3 className="mt-3 font-serif text-lg">{item.title}</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{item.text}
							</p>
						</div>
					))}
				</div>

				<div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_2px_10px_-4px_oklch(0.64_0.11_12_/_0.14)]">
					<div className="grid grid-cols-3 gap-2 bg-accent/60 px-6 py-4 font-medium text-sm">
						<span className="text-muted-foreground">Poređenje</span>
						<span className="text-primary">Skupa šminka</span>
						<span className="text-muted-foreground">Budžetska šminka</span>
					</div>
					{COMPARISON_ROWS.map((row) => (
						<div
							key={row.label}
							className="grid grid-cols-3 gap-2 border-t px-6 py-4 text-sm"
						>
							<span className="text-muted-foreground">{row.label}</span>
							<span className="font-medium">{row.premium}</span>
							<span className="text-muted-foreground">{row.budget}</span>
						</div>
					))}
				</div>
			</div>

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
