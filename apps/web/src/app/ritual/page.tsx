import type { Metadata } from "next";

import AmbientBackground from "@/components/ambient-background";
import Logo from "@/components/logo";

import RitualQuiz from "./ritual-quiz";

export const metadata: Metadata = {
	title: "Pronađi svoj ritual · Vellure",
	description:
		"Odgovorite na 5 kratkih pitanja i Vellure asistent sastavlja ritual od 3 proizvoda baš za vas.",
};

export default function RitualPage() {
	return (
		<div className="relative isolate overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
				<p className="text-primary text-sm uppercase tracking-[0.2em]">
					Pronađi svoj ritual
				</p>
				<h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
					Pet pitanja. Tri proizvoda.{" "}
					<span className="whitespace-nowrap">
						Jedan <Logo className="text-4xl md:text-5xl" /> ritual.
					</span>
				</h1>
				<p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
					Recite nam kako volite da izgledate, a naš asistent bira set koji se
					lepo dopunjuje — od baze do usana. Sve možete dodati u korpu jednim
					klikom.
				</p>
				<RitualQuiz />
			</div>
		</div>
	);
}
