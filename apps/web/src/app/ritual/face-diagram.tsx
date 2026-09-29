/**
 * Line-art portret gledan spreda (zatvorene oči), minimalistička ilustracija.
 * Zona za dati korak se boji primarnom bojom sajta preko crteža.
 */
export type FaceArea =
	| "priprema"
	| "ten"
	| "konture"
	| "obrve"
	| "oci"
	| "trepavice"
	| "usne"
	| "fiksiranje";

const LABEL: Record<FaceArea, string> = {
	priprema: "Cela koža",
	ten: "Ten",
	konture: "Konture i rumenilo",
	obrve: "Obrve",
	oci: "Kapak i pregib",
	trepavice: "Trepavice",
	usne: "Usne",
	fiksiranje: "T-zona",
};

// viewBox 200×260 — lice spreda, blago nagnuto (grupa je rotirana).
const FACE =
	"M100 46 C132 46 152 74 152 110 C152 142 138 174 116 188 C108 193 104 194 100 194 C96 194 92 193 84 188 C62 174 48 142 48 110 C48 74 68 46 100 46 Z";
const UPPER_LIP = "M86 164 C89 156 96 155 100 160 C104 155 111 156 114 164";
const LOWER_LIP = "M86 164 C89 180 111 180 114 164";
const EYE_L = "M70 116 C76 122 86 122 92 116";
const EYE_R = "M108 116 C114 122 124 122 130 116";
const BROW_L = "M66 101 C74 98 86 97 95 98";
const BROW_R = "M105 98 C114 97 126 98 134 101";

export default function FaceDiagram({
	area,
	className,
}: {
	area: FaceArea;
	className?: string;
}) {
	const zone = "fill-primary/35 stroke-primary";
	const soft = "fill-primary/14 stroke-primary/50";
	const ink = "stroke-foreground/70";
	const inkSoft = "stroke-foreground/45";

	return (
		<svg
			viewBox="0 0 200 260"
			role="img"
			aria-label={`Ilustracija: ${LABEL[area]}`}
			className={className}
			fill="none"
			strokeWidth={1.3}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<g transform="rotate(-7 100 130)">
				{/* kosa — duga, ravna, uokviruje lice do ramena */}
				<path d="M100 22 C60 22 34 54 36 104 C38 140 30 180 42 250 L158 250 C170 180 162 140 164 104 C166 54 140 22 100 22 Z" className="fill-primary/7 stroke-foreground/45" strokeWidth={1.4} />
				<path d="M46 130 C40 170 38 210 46 250" className="stroke-foreground/18" />
				<path d="M154 130 C160 170 162 210 154 250" className="stroke-foreground/18" />
				{/* lice — popunjeno bojom pozadine da sakrije kosu iza */}
				<path d={FACE} className="fill-background stroke-foreground/70" strokeWidth={1.5} />
				{/* ---------- zone ---------- */}
				{area === "priprema" && <path d={FACE} className={soft} />}
				{area === "ten" && (
					<>
						<path d={FACE} className={soft} />
						<ellipse cx="100" cy="88" rx="22" ry="12" className={zone} />
						<ellipse cx="70" cy="140" rx="12" ry="8" className={zone} />
						<ellipse cx="130" cy="140" rx="12" ry="8" className={zone} />
						<ellipse cx="100" cy="178" rx="8" ry="4.5" className={zone} />
					</>
				)}
				{area === "fiksiranje" && (
					<path d="M76 78 H124 V90 H106 V146 C106 149 103 151 100 151 C97 151 94 149 94 146 V90 H76 Z" className={zone} />
				)}
				{area === "konture" && (
					<>
						<path d="M58 136 C66 124 80 120 92 130 C86 142 72 148 60 144 Z" className={zone} />
						<path d="M142 136 C134 124 120 120 108 130 C114 142 128 148 140 144 Z" className={zone} />
						<path d="M58 90 C53 104 52 118 54 132" className="stroke-primary" strokeWidth={6} strokeOpacity={0.35} />
						<path d="M142 90 C147 104 148 118 146 132" className="stroke-primary" strokeWidth={6} strokeOpacity={0.35} />
						<path d="M80 184 C87 190 93 192 100 192 C107 192 113 190 120 184" className="stroke-primary" strokeWidth={5} strokeOpacity={0.3} />
						<path d="M64 126 C70 120 80 118 88 122" className="stroke-primary" strokeWidth={3} strokeOpacity={0.45} />
						<path d="M112 122 C120 118 130 120 136 126" className="stroke-primary" strokeWidth={3} strokeOpacity={0.45} />
						<ellipse cx="99" cy="138" rx="3" ry="6" className={soft} />
						<ellipse cx="100" cy="158" rx="5" ry="2.5" className={soft} />
					</>
				)}
				{area === "oci" && (
					<>
						<path d="M68 111 C75 103 88 103 94 113 C88 118 75 118 68 111 Z" className={zone} />
						<path d="M106 113 C112 103 125 103 132 111 C125 118 112 118 106 113 Z" className={zone} />
						<path d="M67 108 C75 99 89 99 95 109" className="stroke-primary" strokeWidth={3} strokeOpacity={0.4} />
						<path d="M105 109 C111 99 125 99 133 108" className="stroke-primary" strokeWidth={3} strokeOpacity={0.4} />
					</>
				)}
				{area === "trepavice" && (
					<>
						<path d={EYE_L} className="stroke-primary" strokeWidth={2.8} />
						<path d={EYE_R} className="stroke-primary" strokeWidth={2.8} />
						<path d="M71 117 l-3 5 M76 120 l-2 6 M81 121 l0 6 M86 120 l2 6 M91 117 l3 5 M109 117 l-3 5 M114 120 l-2 6 M119 121 l0 6 M124 120 l2 6 M129 117 l3 5" className="stroke-primary" strokeWidth={1.4} />
					</>
				)}
				{area === "obrve" && (
					<>
						<path d={BROW_L} className="stroke-primary" strokeWidth={7} strokeOpacity={0.4} />
						<path d={BROW_R} className="stroke-primary" strokeWidth={7} strokeOpacity={0.4} />
					</>
				)}
				{area === "usne" && <path d={`${UPPER_LIP} ${LOWER_LIP} Z`} className={zone} />}

				{/* ---------- linijski crtež ---------- */}
				{/* obrve — ravne, jedna linija */}
				<path d={BROW_L} className={ink} strokeWidth={2.4} />
				<path d={BROW_R} className={ink} strokeWidth={2.4} />
				{/* zatvorene oči sa trepavicama */}
				<path d={EYE_L} className={ink} strokeWidth={1.7} />
				<path d={EYE_R} className={ink} strokeWidth={1.7} />
				<path d="M71 117 l-2 4 M76 120 l-1 4 M81 121 l0 4 M86 120 l1 4 M91 117 l2 4" className={ink} strokeWidth={1} />
				<path d="M109 117 l-2 4 M114 120 l-1 4 M119 121 l0 4 M124 120 l1 4 M129 117 l2 4" className={ink} strokeWidth={1} />
				{/* nos — mali, prćast */}
				<path d="M100 126 C99 132 98 137 98 140" className={inkSoft} />
				<path d="M95 143 C97 146 103 146 105 143" className={inkSoft} />
				<path d="M94 141 c-1.5 1 -1.5 2.5 0 3 M106 141 c1.5 1 1.5 2.5 0 3" className={inkSoft} />
				{/* usne — pune, Russian lips */}
				<path d={UPPER_LIP} className={ink} strokeWidth={1.5} />
				<path d={LOWER_LIP} className={ink} strokeWidth={1.5} />
				<path d="M88 164 C94 166 106 166 112 164" className={inkSoft} />
				{/* vrat i ramena */}
				<path d="M88 192 C89 204 88 214 82 222 C64 226 48 236 40 250" className={inkSoft} />
				<path d="M112 192 C111 204 112 214 118 222 C136 226 152 236 160 250" className={inkSoft} />
			</g>
		</svg>
	);
}

export function faceAreaLabel(area: string) {
	return LABEL[(area as FaceArea) in LABEL ? (area as FaceArea) : "ten"];
}
