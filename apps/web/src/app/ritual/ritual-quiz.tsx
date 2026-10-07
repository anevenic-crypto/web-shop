"use client";

import { Button } from "@web-shop/ui/components/button";
import {
	ArrowLeft,
	ArrowRight,
	Brush,
	Check,
	Wand2,
	RotateCcw,
	ShoppingBag,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { addToCart } from "@/lib/cart";

import FaceDiagram, { type FaceArea, faceAreaLabel } from "./face-diagram";

const CHAT_API = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:8000";

type Answers = {
	stil: string;
	fokus: string[];
	prilika: string;
	boje: string;
	budzet: string;
};

type Question = {
	key: keyof Answers;
	title: string;
	subtitle: string;
	options: string[];
	multi?: boolean;
};

const QUESTIONS: Question[] = [
	{
		key: "stil",
		title: "Kakav look najčešće nosite?",
		subtitle: "Nema pogrešnog odgovora — samo iskreno.",
		options: [
			"Prirodno, „bez šminke” efekat",
			"Uredno i klasično",
			"Glamurozno i upadljivo",
			"Eksperimentišem, volim boje",
		],
	},
	{
		key: "fokus",
		title: "Šta volite da istaknete?",
		subtitle: "Izaberite sve što vam je važno — za svaku oblast dobijate po jedan proizvod.",
		options: ["Usne", "Oči", "Ten i sjaj kože", "Obrve", "Trepavice", "Rumenilo i konture"],
		multi: true,
	},
	{
		key: "prilika",
		title: "Za koju priliku?",
		subtitle: "Da set ima smisla i u 8 ujutru i u 8 uveče.",
		options: [
			"Svaki dan, posao ili fakultet",
			"Izlazak i večernje prilike",
			"Poseban događaj ili proslava",
			"Sve od toga — želim univerzalno",
		],
	},
	{
		key: "boje",
		title: "Koje nijanse vam prijaju?",
		subtitle: "Pomaže nam da pogodimo ton.",
		options: [
			"Tople: breskva, karamela, terakota",
			"Hladne: ružičasta, malina, šljiva",
			"Neutralne: nude, bež, braon",
			"Jake: crvena, bordo, fuksija",
		],
	},
	{
		key: "budzet",
		title: "Koliki je budžet za glavni set?",
		subtitle: "Dodatne preporuke i pribor prikazujemo posebno.",
		options: [
			"Do 15.000 RSD",
			"15.000 – 30.000 RSD",
			"30.000 – 50.000 RSD",
			"Nije bitno, hoću najbolje",
		],
	},
];

type RitualProduct = {
	productId: string;
	slug: string;
	name: string;
	brand: string | null;
	priceRsd: number;
	image: string | null;
	variantId: string | null;
	variantName: string | null;
	reason: string;
	step: string;
};

type Ritual = {
	title: string;
	intro: string;
	products: RitualProduct[];
	extras: RitualProduct[];
	tools: RitualProduct[];
	guide: GuideStep[];
	total: number;
};

type GuideStep = {
	area: string;
	title: string;
	text: string;
	product: string | null;
};

function formatRsd(price: number) {
	return `${price.toLocaleString("sr-RS")} RSD`;
}

const EMPTY: Answers = { stil: "", fokus: [], prilika: "", boje: "", budzet: "" };

function toCartItem(p: RitualProduct) {
	return {
		productId: p.productId,
		variantId: p.variantId ?? undefined,
		name: p.name,
		variantName: p.variantName ?? undefined,
		priceRsd: p.priceRsd,
		image: p.image ?? undefined,
	};
}

function ProductRow({
	p,
	index,
	onAdd,
}: {
	p: RitualProduct;
	index: number;
	onAdd: (p: RitualProduct) => void;
}) {
	return (
		<div
			className="fade-in slide-in-from-bottom-3 animate-in flex gap-4 overflow-hidden rounded-3xl border border-border bg-card fill-mode-backwards p-4 shadow-[0_2px_10px_-4px_oklch(0.64_0.11_12_/_0.16)] duration-700 sm:gap-6"
			style={{ animationDelay: `${index * 100}ms` }}
		>
			<Link
				href={`/proizvod/${p.slug}`}
				className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-32"
			>
				{p.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={p.image} alt={p.name} className="size-full object-cover" />
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground text-xs">
						Bez slike
					</div>
				)}
			</Link>
			<div className="flex min-w-0 flex-1 flex-col">
				<p className="text-primary text-xs uppercase tracking-[0.15em]">{p.step}</p>
				<Link href={`/proizvod/${p.slug}`} className="mt-1 font-serif text-lg leading-snug hover:underline">
					{p.name}
					{p.variantName ? <span className="text-muted-foreground"> · {p.variantName}</span> : null}
				</Link>
				{p.brand && (
					<p className="text-muted-foreground text-xs uppercase tracking-wide">{p.brand}</p>
				)}
				<p className="mt-2 text-muted-foreground text-sm leading-relaxed">{p.reason}</p>
				<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
					<p className="font-semibold text-primary">{formatRsd(p.priceRsd)}</p>
					<Button size="sm" variant="outline" onClick={() => onAdd(p)}>
						<ShoppingBag className="size-4" /> Dodaj
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function RitualQuiz() {
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<Answers>(EMPTY);
	const [loading, setLoading] = useState(false);
	const [ritual, setRitual] = useState<Ritual | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [elapsed, setElapsed] = useState(0);

	// Bot na besplatnom hostingu "zaspi" — probudi ga čim se otvori kviz,
	// da bude spreman kad korisnik odgovori na pitanja.
	useEffect(() => {
		fetch(`${CHAT_API}/api/health`).catch(() => {});
	}, []);

	// brojač sekundi dok se čeka odgovor (za poruke korisniku)
	useEffect(() => {
		if (!loading) return;
		setElapsed(0);
		const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
		return () => window.clearInterval(id);
	}, [loading]);

	const q = QUESTIONS[step];
	const progress = ritual ? 100 : Math.round((step / QUESTIONS.length) * 100);

	async function submit(finalAnswers: Answers) {
		setLoading(true);
		setError(null);
		try {
			const call = () =>
				fetch(`${CHAT_API}/api/ritual`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(finalAnswers),
				});
			// ako prvi pokušaj padne (bot se još budi), sačekaj 3 s i probaj još jednom
			const res = await call().catch(
				() => new Promise<Response>((r) => setTimeout(() => r(call()), 3000)),
			);
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as { detail?: string } | null;
				throw new Error(body?.detail ?? `Greška ${res.status}`);
			}
			setRitual((await res.json()) as Ritual);
		} catch (e) {
			setError(
				e instanceof Error && e.message !== "Failed to fetch"
					? e.message
					: "Asistent trenutno nije dostupan. Pokušajte za koji trenutak.",
			);
		} finally {
			setLoading(false);
		}
	}

	function advance(next: Answers) {
		setAnswers(next);
		if (step < QUESTIONS.length - 1) {
			setStep(step + 1);
		} else {
			void submit(next);
		}
	}

	function chooseSingle(option: string) {
		advance({ ...answers, [q.key]: option });
	}

	function toggleMulti(option: string) {
		const current = answers.fokus;
		const next = current.includes(option)
			? current.filter((o) => o !== option)
			: [...current, option];
		setAnswers({ ...answers, fokus: next });
	}

	function reset() {
		setStep(0);
		setAnswers(EMPTY);
		setRitual(null);
		setError(null);
	}

	function addOne(p: RitualProduct) {
		addToCart(toCartItem(p), 1);
		toast.success(`${p.name} je dodat u korpu.`);
	}

	function addAll(list: RitualProduct[], label: string) {
		for (const p of list) addToCart(toCartItem(p), 1);
		toast.success(label, {
			action: { label: "Pogledaj korpu", onClick: () => (window.location.href = "/korpa") },
		});
	}

	return (
		<div className="mt-10">
			{/* progres */}
			<div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-[0.15em]">
				<span>{ritual ? "Vaš ritual" : `Pitanje ${step + 1} od ${QUESTIONS.length}`}</span>
				<span>{progress}%</span>
			</div>
			<div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-primary transition-all duration-500"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* učitavanje */}
			{loading && (
				<div className="fade-in animate-in mt-12 flex flex-col items-center gap-4 py-16 text-center duration-500">
					<Sparkles className="size-8 animate-pulse text-primary" />
					<p className="font-serif text-2xl">
						{elapsed < 10
							? "Sastavljamo vaš ritual…"
							: elapsed < 30
								? "Biramo proizvode za svaku oblast…"
								: elapsed < 50
									? "Pišemo vodič korak po korak…"
									: "Još malo, skoro je gotovo…"}
					</p>
					<p className="text-muted-foreground text-sm">
						{elapsed < 30
							? "Biramo proizvod za svaku oblast, dodatne preporuke i pribor."
							: "Asistent pažljivo sastavlja ceo look — ovo može potrajati do minut."}
					</p>
					<p className="text-muted-foreground/60 text-xs tabular-nums">{elapsed}s</p>
				</div>
			)}

			{/* greška */}
			{!loading && error && (
				<div className="mt-10 rounded-3xl border border-destructive/40 bg-card p-6">
					<p className="font-medium">Nismo uspeli da sastavimo ritual.</p>
					<p className="mt-1 text-muted-foreground text-sm">{error}</p>
					<div className="mt-4 flex gap-2">
						<Button onClick={() => void submit(answers)}>Pokušaj ponovo</Button>
						<Button variant="outline" onClick={reset}>
							Od početka
						</Button>
					</div>
				</div>
			)}

			{/* pitanje */}
			{!loading && !error && !ritual && (
				<div key={step} className="fade-in slide-in-from-bottom-2 animate-in mt-10 duration-500">
					<h2 className="font-serif text-2xl md:text-3xl">{q.title}</h2>
					<p className="mt-1 text-muted-foreground text-sm">{q.subtitle}</p>
					<div className="mt-6 grid gap-3 sm:grid-cols-2">
						{q.options.map((opt, i) => {
							const selected = q.multi && answers.fokus.includes(opt);
							return (
								<button
									key={opt}
									type="button"
									aria-pressed={q.multi ? !!selected : undefined}
									onClick={() => (q.multi ? toggleMulti(opt) : chooseSingle(opt))}
									className={`fade-in slide-in-from-bottom-2 animate-in flex items-center justify-between gap-3 rounded-2xl border bg-card fill-mode-backwards p-5 text-left transition-all duration-500 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_16px_32px_-14px_oklch(0.64_0.11_12_/_0.35)] focus-visible:border-primary focus-visible:outline-none ${
										selected ? "border-primary bg-primary/5" : "border-border"
									}`}
									style={{ animationDelay: `${i * 70}ms` }}
								>
									<span className="font-medium">{opt}</span>
									{q.multi && (
										<span
											className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
												selected
													? "border-primary bg-primary text-primary-foreground"
													: "border-border"
											}`}
										>
											{selected && <Check className="size-3.5" strokeWidth={3} />}
										</span>
									)}
								</button>
							);
						})}
					</div>
					<div className="mt-6 flex items-center justify-between">
						{step > 0 ? (
							<button
								type="button"
								onClick={() => setStep(step - 1)}
								className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
							>
								<ArrowLeft className="size-4" /> Prethodno pitanje
							</button>
						) : (
							<span />
						)}
						{q.multi && (
							<Button
								onClick={() => advance(answers)}
								disabled={answers.fokus.length === 0}
								className="rounded-full px-6"
							>
								Dalje{answers.fokus.length > 0 ? ` (${answers.fokus.length})` : ""}
								<ArrowRight className="size-4" />
							</Button>
						)}
					</div>
				</div>
			)}

			{/* rezultat */}
			{!loading && ritual && (
				<div className="fade-in slide-in-from-bottom-3 animate-in mt-10 duration-700">
					<p className="text-primary text-sm uppercase tracking-[0.2em]">Vaš ritual</p>
					<h2 className="mt-2 font-serif text-3xl md:text-4xl">{ritual.title}</h2>
					<p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">{ritual.intro}</p>

					{/* glavni set */}
					<div className="mt-8 flex flex-col gap-4">
						{ritual.products.map((p, i) => (
							<ProductRow key={`${p.productId}:${p.variantId ?? ""}`} p={p} index={i} onAdd={addOne} />
						))}
					</div>

					<div className="mt-6 flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-muted-foreground text-xs uppercase tracking-[0.15em]">
								Glavni ritual · {ritual.products.length}{" "}
								{ritual.products.length === 1 ? "proizvod" : "proizvoda"}
							</p>
							<p className="font-serif text-2xl">{formatRsd(ritual.total)}</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" onClick={reset}>
								<RotateCcw className="size-4" /> Ponovi kviz
							</Button>
							<Button onClick={() => addAll(ritual.products, "Ceo ritual je u korpi.")}>
								Dodaj sve u korpu <ArrowRight className="size-4" />
							</Button>
						</div>
					</div>

					{/* dodatne preporuke */}
					{ritual.extras.length > 0 && (
						<div className="mt-14">
							<div className="flex items-end justify-between gap-4">
								<div>
									<p className="text-primary text-sm uppercase tracking-[0.2em]">Preporučujemo uz to</p>
									<h3 className="mt-1 font-serif text-2xl">Da ritual bude potpun</h3>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => addAll(ritual.extras, "Dodatne preporuke su u korpi.")}
								>
									Dodaj sve
								</Button>
							</div>
							<div className="mt-6 flex flex-col gap-4">
								{ritual.extras.map((p, i) => (
									<ProductRow key={`${p.productId}:${p.variantId ?? ""}`} p={p} index={i} onAdd={addOne} />
								))}
							</div>
						</div>
					)}

					{/* pribor */}
					{ritual.tools.length > 0 && (
						<div className="mt-14">
							<div className="flex items-end justify-between gap-4">
								<div>
									<p className="flex items-center gap-2 text-primary text-sm uppercase tracking-[0.2em]">
										<Brush className="size-4" /> Pribor i alati
									</p>
									<h3 className="mt-1 font-serif text-2xl">Šta vam treba za nanošenje</h3>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => addAll(ritual.tools, "Pribor je u korpi.")}
								>
									Dodaj sve
								</Button>
							</div>
							<div className="mt-6 flex flex-col gap-4">
								{ritual.tools.map((p, i) => (
									<ProductRow key={`${p.productId}:${p.variantId ?? ""}`} p={p} index={i} onAdd={addOne} />
								))}
							</div>
						</div>
					)}

					{/* vodič kroz ceo look */}
					{ritual.guide.length > 0 && (
						<div className="mt-16">
							<p className="flex items-center gap-2 text-primary text-sm uppercase tracking-[0.2em]">
								<Wand2 className="size-4" /> Vodič kroz ceo look
							</p>
							<h3 className="mt-1 font-serif text-2xl md:text-3xl">Korak po korak, pred ogledalom</h3>
							<p className="mt-2 max-w-xl text-muted-foreground text-sm">
								Ceo make-up od pripremljene kože do fiksiranja — ne samo proizvodi iz seta. Obojena zona
								na crtežu pokazuje gde se korak nanosi.
							</p>

							<ol className="mt-8 flex flex-col gap-5">
								{ritual.guide.map((g, i) => (
									<li
										key={`${g.area}-${i}`}
										className="fade-in slide-in-from-bottom-3 animate-in grid gap-5 rounded-3xl border border-border bg-card fill-mode-backwards p-5 duration-700 sm:grid-cols-[140px_1fr] sm:p-6"
										style={{ animationDelay: `${i * 90}ms` }}
									>
										<div className="flex flex-col items-center gap-2">
											<FaceDiagram
												area={g.area as FaceArea}
												className="w-28 sm:w-full"
											/>
											<span className="text-muted-foreground text-[11px] uppercase tracking-[0.15em]">
												{faceAreaLabel(g.area)}
											</span>
										</div>
										<div>
											<div className="flex items-center gap-3">
												<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
													{i + 1}
												</span>
												<h4 className="font-serif text-xl">{g.title}</h4>
											</div>
											<p className="mt-3 text-muted-foreground leading-relaxed">{g.text}</p>
											{g.product && (
												<p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary text-xs">
													<Sparkles className="size-3.5" /> Koristite: {g.product}
												</p>
											)}
										</div>
									</li>
								))}
							</ol>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
