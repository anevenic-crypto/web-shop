"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "./logo";

export default function Footer() {
	const pathname = usePathname();
	const year = new Date().getFullYear();

	if (pathname?.startsWith("/admin")) {
		return null;
	}

	return (
		<footer className="relative mt-16 overflow-hidden border-t">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-[radial-gradient(60%_80%_at_50%_100%,oklch(0.93_0.03_14)_0%,transparent_70%)]"
			/>
			<div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
				<div>
					<Logo className="text-2xl" />
					<p className="mt-3 max-w-xs text-muted-foreground text-sm leading-relaxed">
						Pažljivo odabrana luksuzna šminka svetskih kuća — za trenutke kad
						želite da izgledate nezaboravno.
					</p>
					<div className="mt-4 flex gap-4 text-muted-foreground text-sm">
						{/* biome-ignore lint/a11y/useValidAnchor: društvene mreže još nisu otvorene, mesto rezervisano za budući link */}
						<a href="#" className="hover:text-primary">
							Instagram
						</a>
						{/* biome-ignore lint/a11y/useValidAnchor: društvene mreže još nisu otvorene, mesto rezervisano za budući link */}
						<a href="#" className="hover:text-primary">
							TikTok
						</a>
						{/* biome-ignore lint/a11y/useValidAnchor: društvene mreže još nisu otvorene, mesto rezervisano za budući link */}
						<a href="#" className="hover:text-primary">
							Facebook
						</a>
					</div>
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
				<div>
					<p className="mb-3 text-muted-foreground text-xs uppercase tracking-[0.15em]">
						Informacije
					</p>
					<div className="flex flex-col gap-2 text-sm">
						<Link href="/o-nama" className="w-fit hover:text-primary">
							O nama
						</Link>
						<Link href="/o-nama#kontakt" className="w-fit hover:text-primary">
							Kontakt
						</Link>
					</div>
				</div>
			</div>
			<div className="border-t px-6 py-6 text-center text-muted-foreground text-xs">
				© {year} <Logo className="text-xs not-italic" />. Sva prava zadržana.
			</div>
		</footer>
	);
}
