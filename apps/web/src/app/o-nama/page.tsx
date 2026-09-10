import AmbientBackground from "@/components/ambient-background";
import Logo from "@/components/logo";

import ContactForm from "./contact-form";

export default function ONamaPage() {
	return (
		<div className="relative isolate overflow-hidden">
			<AmbientBackground />
			<div className="mx-auto max-w-2xl px-6 py-20">
				<p className="text-primary text-sm uppercase tracking-[0.2em]">
					O nama
				</p>
				<h1 className="mt-2 font-serif text-4xl">
					Iza <Logo className="text-4xl" /> stoji ljubav prema lepoj šminci
				</h1>
				<div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
					<p>
						Vellure je nastao iz jednostavne ideje — da luksuzna šminka
						zaslužuje mesto gde se bira sa pažnjom, a ne gomila na gomili. Svaki
						proizvod u ponudi je lično odabran, ne dodajemo nešto samo zato što
						postoji.
					</p>
					<p>
						Fokusirani smo isključivo na šminku — od ruževa i karmina do paleta
						senki i puderа — jer verujemo da je bolje raditi jednu stvar dobro
						nego sve pomalo.
					</p>
				</div>

				<div className="mt-10 rounded-3xl border border-border bg-card p-6">
					<h2 className="font-serif text-lg">Kako funkcioniše porudžbina</h2>
					<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
						Dodate proizvode u korpu, ostavite kontakt podatke, i mi vas
						pozovemo da potvrdimo porudžbinu, dostupnost i način
						dostave/plaćanja. Nema skrivenih koraka — sve se dogovara direktno
						sa vama pre nego što porudžbina krene.
					</p>
				</div>

				<div id="kontakt" className="mt-14 scroll-mt-24">
					<h2 className="font-serif text-2xl">Kontaktirajte nas</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Pitanje o proizvodu, nijansi ili porudžbini? Pišite nam.
					</p>
					<ContactForm />
				</div>
			</div>
		</div>
	);
}
