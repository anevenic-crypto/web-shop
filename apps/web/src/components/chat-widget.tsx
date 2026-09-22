"use client";

import { MessageCircle, Send, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart";

const CHAT_API = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:8000";

type Msg = {
	role: "user" | "assistant";
	content: string;
	addedToCart?: string[]; // nazivi proizvoda koje je bot ubacio u korpu uz ovu poruku
};

type CartAction = {
	type: "add_to_cart";
	quantity: number;
	item: {
		productId: string;
		variantId?: string;
		name: string;
		variantName?: string;
		priceRsd: number;
		image?: string | null;
	};
};

const CONVERSATION_KEY = "vellure-chat-id";

/** Jedan ID po sesiji browsera, da admin vidi ceo razgovor na jednom mestu. */
function getConversationId() {
	try {
		let id = sessionStorage.getItem(CONVERSATION_KEY);
		if (!id) {
			id = crypto.randomUUID();
			sessionStorage.setItem(CONVERSATION_KEY, id);
		}
		return id;
	} catch {
		return undefined;
	}
}

const WELCOME: Msg = {
	role: "assistant",
	content:
		"Zdravo! Ja sam Vellure asistent. Pomoći ću vam da pronađete pravi proizvod — recite mi šta tražite. 💄",
};

/** Pretvara [tekst](url) iz odgovora u klikabilne linkove; ostalo ostaje običan tekst. */
function renderContent(text: string) {
	const parts: React.ReactNode[] = [];
	const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
	let last = 0;
	let m: RegExpExecArray | null = re.exec(text);
	while (m !== null) {
		if (m.index > last) parts.push(text.slice(last, m.index));
		parts.push(
			<a
				key={m.index}
				href={m[2]}
				className="font-medium underline underline-offset-2 hover:opacity-80"
			>
				{m[1]}
			</a>,
		);
		last = m.index + m[0].length;
		m = re.exec(text);
	}
	if (last < text.length) parts.push(text.slice(last));
	return parts;
}

export default function ChatWidget() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Msg[]>([WELCOME]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, open]);

	const send = async (e: FormEvent) => {
		e.preventDefault();
		const text = input.trim();
		if (!text || loading) return;
		setInput("");

		const history: Msg[] = [...messages, { role: "user", content: text }];
		setMessages(history);
		setLoading(true);

		try {
			const res = await fetch(`${CHAT_API}/api/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				// Ne šaljemo pozdravnu poruku, samo pravi razgovor
				body: JSON.stringify({
					messages: history.slice(1),
					conversation_id: getConversationId(),
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.detail ?? data.greska ?? "Greška");

			// Ako je bot odlučio da doda nešto u korpu, uradi to ovde u browseru
			const added: string[] = [];
			for (const a of (data.actions ?? []) as CartAction[]) {
				if (a.type !== "add_to_cart") continue;
				addToCart(
					{
						productId: a.item.productId,
						variantId: a.item.variantId,
						name: a.item.name,
						variantName: a.item.variantName,
						priceRsd: a.item.priceRsd,
						image: a.item.image ?? undefined,
					},
					a.quantity,
				);
				added.push(
					a.item.variantName ? `${a.item.name} — ${a.item.variantName}` : a.item.name,
				);
			}

			setMessages([
				...history,
				{ role: "assistant", content: data.reply, addedToCart: added },
			]);
		} catch (err) {
			setMessages([
				...history,
				{
					role: "assistant",
					content:
						"Trenutno ne mogu da odgovorim. Pokušajte ponovo za trenutak ili nam pišite preko kontakt forme.",
				},
			]);
			console.error("Chat greška:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Dugme u donjem desnom uglu */}
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-label={open ? "Zatvori chat" : "Otvori chat"}
				className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
			>
				{open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
			</button>

			{/* Prozor chata */}
			{open && (
				<div className="fixed right-5 bottom-24 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
					<div className="border-b px-4 py-3">
						<p className="font-serif text-base">Vellure asistent</p>
						<p className="text-muted-foreground text-xs">
							Pitajte me za proizvode i porudžbine
						</p>
					</div>

					<div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
						{messages.map((m, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: poruke se samo dodaju na kraj
								key={i}
								className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
									m.role === "user"
										? "ml-auto rounded-br-md bg-primary text-primary-foreground"
										: "mr-auto rounded-bl-md bg-muted"
								}`}
							>
								{renderContent(m.content)}
								{m.addedToCart && m.addedToCart.length > 0 && (
									<Link
										href="/korpa"
										className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs hover:bg-accent"
									>
										<ShoppingBag className="size-4 shrink-0" />
										<span>
											Dodato u korpu: {m.addedToCart.join(", ")} · Pogledaj korpu →
										</span>
									</Link>
								)}
							</div>
						))}
						{loading && (
							<div className="mr-auto rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-muted-foreground text-sm">
								Piše…
							</div>
						)}
						<div ref={bottomRef} />
					</div>

					<form onSubmit={send} className="flex gap-2 border-t p-3">
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Napišite poruku…"
							className="flex-1 rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
						<button
							type="submit"
							disabled={loading || !input.trim()}
							aria-label="Pošalji"
							className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
						>
							<Send className="size-4" />
						</button>
					</form>
				</div>
			)}
		</>
	);
}
