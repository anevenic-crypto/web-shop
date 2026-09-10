"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@web-shop/ui/components/button";
import { Input } from "@web-shop/ui/components/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@web-shop/ui/components/sheet";
import {
	Home,
	Info,
	Menu,
	Search,
	ShieldCheck,
	ShoppingBag,
	Sparkles,
	Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getCartCount, subscribeToCart } from "@/lib/cart";
import { trpc } from "@/utils/trpc";

import Logo from "./logo";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const navItemClass =
	"flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all hover:translate-x-1 hover:bg-accent hover:text-accent-foreground";

export default function Header() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const { data: categories } = useQuery(
		trpc.categories.listPublic.queryOptions(),
	);
	const [open, setOpen] = useState(false);
	const [cartCount, setCartCount] = useState(0);
	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState("");

	useEffect(() => {
		const refresh = () => setCartCount(getCartCount());
		refresh();
		return subscribeToCart(refresh);
	}, []);

	const close = () => setOpen(false);

	return (
		<div className="sticky top-0 z-40 border-border/60 border-b bg-background/80 backdrop-blur-md">
			<div className="flex flex-row items-center justify-between px-4 py-3">
				<div className="flex items-center gap-3">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger
							render={
								<Button
									variant="outline"
									size="icon"
									className="rounded-full border-primary/20 bg-card shadow-[0_2px_8px_-2px_oklch(0.64_0.11_12_/_0.35)] transition-transform hover:scale-105 hover:bg-accent active:scale-95"
								/>
							}
						>
							<Menu />
							<span className="sr-only">Meni</span>
						</SheetTrigger>
						<SheetContent side="left" className="overflow-y-auto sm:max-w-md">
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(80%_60%_at_20%_0%,oklch(0.93_0.03_14)_0%,transparent_70%)]"
							/>
							<SheetHeader>
								<SheetTitle className="fade-in slide-in-from-top-2 flex animate-in items-center gap-2 text-2xl duration-500">
									<Sparkles className="size-5 text-primary" />
									<Logo />
								</SheetTitle>
								<p className="fade-in slide-in-from-top-2 animate-in text-muted-foreground text-xs uppercase tracking-[0.15em] delay-75 duration-500">
									Prestižna kozmetika
								</p>
							</SheetHeader>

							<nav className="flex flex-col gap-1 px-2 pt-2">
								<Link
									href="/"
									className={`${navItemClass} fade-in slide-in-from-left-2 animate-in fill-mode-backwards duration-500`}
									style={{ animationDelay: "100ms" }}
									onClick={close}
								>
									<Home className="size-4 text-primary" />
									Početna
								</Link>
								<Link
									href="/prodavnica"
									className={`${navItemClass} fade-in slide-in-from-left-2 animate-in fill-mode-backwards duration-500`}
									style={{ animationDelay: "160ms" }}
									onClick={close}
								>
									<Store className="size-4 text-primary" />
									Prodavnica
								</Link>
								<Link
									href="/korpa"
									className={`${navItemClass} fade-in slide-in-from-left-2 animate-in fill-mode-backwards duration-500`}
									style={{ animationDelay: "220ms" }}
									onClick={close}
								>
									<ShoppingBag className="size-4 text-primary" />
									Korpa{cartCount > 0 ? ` (${cartCount})` : ""}
								</Link>
								<Link
									href="/o-nama"
									className={`${navItemClass} fade-in slide-in-from-left-2 animate-in fill-mode-backwards duration-500`}
									style={{ animationDelay: "280ms" }}
									onClick={close}
								>
									<Info className="size-4 text-primary" />O nama
								</Link>
								{session?.user.role === "admin" && (
									<Link
										href="/admin"
										className={`${navItemClass} fade-in slide-in-from-left-2 animate-in fill-mode-backwards duration-500`}
										style={{ animationDelay: "340ms" }}
										onClick={close}
									>
										<ShieldCheck className="size-4 text-primary" />
										Admin
									</Link>
								)}
							</nav>

							{!!categories?.length && (
								<div className="mt-4 border-t px-2 pt-4">
									<p className="fade-in animate-in px-2 pb-2 font-medium text-muted-foreground text-xs uppercase tracking-[0.15em] delay-300 duration-500">
										Kategorije
									</p>
									<div className="flex flex-wrap gap-2 px-2 pb-2">
										{categories.map((cat, i) => (
											<Link
												key={cat.id}
												href={`/kategorija/${cat.slug}`}
												onClick={close}
												style={{ animationDelay: `${360 + i * 30}ms` }}
												className="fade-in zoom-in-95 animate-in rounded-full bg-muted fill-mode-backwards px-3 py-1.5 text-xs transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
											>
												{cat.name}
											</Link>
										))}
									</div>
								</div>
							)}
						</SheetContent>
					</Sheet>
					<Link href="/">
						<Logo className="text-xl" />
					</Link>
				</div>
				<div className="flex items-center gap-1">
					{searchOpen ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (query.trim()) {
									router.push(
										`/prodavnica?q=${encodeURIComponent(query.trim())}`,
									);
									setSearchOpen(false);
								}
							}}
							className="flex items-center"
						>
							<Input
								autoFocus
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onBlur={() => !query && setSearchOpen(false)}
								placeholder="Pretraži proizvode..."
								className="h-8 w-40 sm:w-56"
							/>
						</form>
					) : (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSearchOpen(true)}
							aria-label="Pretraga"
						>
							<Search className="size-5" />
						</Button>
					)}
					<Link href="/korpa">
						<Button variant="ghost" size="icon" className="relative">
							<ShoppingBag className="size-5" />
							{cartCount > 0 && (
								<span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
									{cartCount > 9 ? "9+" : cartCount}
								</span>
							)}
							<span className="sr-only">Korpa</span>
						</Button>
					</Link>
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</div>
	);
}
