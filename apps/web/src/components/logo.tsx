export const BRAND_NAME = "Vellure";

function LogoMark() {
	return (
		<span
			aria-hidden
			className="relative inline-flex shrink-0 items-center justify-center rounded-[0.55em] text-white"
			style={{
				width: "1.7em",
				height: "1.7em",
				background:
					"linear-gradient(155deg, oklch(0.78 0.15 350) 0%, oklch(0.6 0.21 8) 55%, oklch(0.38 0.17 6) 100%)",
				boxShadow:
					"inset 0 1px 1px oklch(1 0 0 / 0.55), inset 0 -3px 4px oklch(0.3 0.15 6 / 0.55), 0 0.14em 0 oklch(0.34 0.14 6), 0 0.4em 0.6em -0.2em oklch(0.5 0.2 8 / 0.6)",
			}}
		>
			<span
				className="font-serif text-[0.62em] leading-none"
				style={{
					textShadow: "0 1px 1px oklch(0.3 0.1 6 / 0.9)",
				}}
			>
				V
			</span>
		</span>
	);
}

export default function Logo({ className }: { className?: string }) {
	return (
		<span
			className={`inline-flex items-center gap-[0.3em] font-serif italic tracking-tight ${className ?? ""}`}
		>
			<LogoMark />
			<span
				className="bg-gradient-to-br from-[oklch(0.66_0.19_10)] via-[oklch(0.52_0.2_8)] to-[oklch(0.36_0.16_6)] bg-clip-text text-transparent"
				style={{
					filter: "drop-shadow(0 1px 0.5px oklch(1 0 0 / 0.4))",
				}}
			>
				{BRAND_NAME}
			</span>
		</span>
	);
}
