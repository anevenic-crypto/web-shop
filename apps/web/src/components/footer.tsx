"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { KissMark } from "@/components/beauty-doodles";

export default function Footer() {
	const pathname = usePathname();
	const year = new Date().getFullYear();

	if (pathname?.startsWith("/admin")) {
		return null;
	}

	return (
		<footer className="relative mt-16 overflow-hidden border-t bg-accent/50">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-[radial-gradient(70%_90%_at_50%_100%,oklch(0.93_0.03_14)_0%,transparent_70%)]"
			/>
			<KissMark className="pointer-events-none absolute top-6 right-6 w-14 rotate-12 text-primary/25 sm:w-20" />
			<div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2">
				<div>
					<p className="font-serif text-2xl">web-shop</p>
					<p className="mt-3 max-w-xs text-muted-foreground text-sm leading-relaxed">
						Pažljivo odabrana luksuzna šminka svetskih kuća — za trenutke kad
						želite da izgledate nezaboravno.
					</p>
				</div>
				<div>
					<p className="mb-3 text-muted-foreground text-xs uppercase tracking-[0.15em]">
						Kupovina
					</p>
					<div className="flex flex-col gap-2 text-sm">
						<Link href="/prodavnica" className="w-fit hover:text-primary">
							Cela prodavnica
						</Link>
						<Link href="/korpa" className="w-fit hover:text-primary">
							Korpa
						</Link>
					</div>
				</div>
			</div>
			<div className="relative border-t px-6 py-6 text-center text-muted-foreground text-xs">
				© {year} web-shop. Sva prava zadržana.
			</div>
		</footer>
	);
}
