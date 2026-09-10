import { Button } from "@web-shop/ui/components/button";
import Link from "next/link";

import AmbientBackground from "@/components/ambient-background";
import Logo from "@/components/logo";

export default function NotFound() {
	return (
		<div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
				<Logo className="text-2xl" />
				<p className="mt-8 font-serif text-7xl text-primary">404</p>
				<h1 className="mt-4 font-serif text-2xl">Ova stranica ne postoji</h1>
				<p className="mt-3 text-muted-foreground">
					Izgleda da je link pokvaren ili je stranica premeštena. Ali kolekcija
					vas i dalje čeka.
				</p>
				<Link href="/prodavnica" className="mt-8">
					<Button size="lg" className="rounded-full px-8">
						Nazad u prodavnicu
					</Button>
				</Link>
			</div>
		</div>
	);
}
