export const BRAND_NAME = "Vellure";

function LogoMark() {
	return (
		<span
			aria-hidden
			className="relative inline-flex shrink-0 items-center justify-center rounded-full"
			style={{
				width: "1.3em",
				height: "1.3em",
				background:
					"radial-gradient(120% 120% at 30% 20%, oklch(0.995 0.006 15) 0%, oklch(0.96 0.025 12) 100%)",
				border: "1px solid oklch(0.9 0.045 10)",
				boxShadow:
					"inset 0 1px 1px oklch(1 0 0 / 0.9), inset 0 -0.1em 0.15em oklch(0.88 0.05 10 / 0.5), 0 0.1em 0.2em -0.08em oklch(0.64 0.11 12 / 0.4)",
			}}
		>
			<span
				className="font-script text-[1.15em] leading-none"
				style={{
					color: "oklch(0.44 0.2 8)",
					transform: "translate(0.02em, 0.05em)",
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
