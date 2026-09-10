export const BRAND_NAME = "Vellure";

export default function Logo({ className }: { className?: string }) {
	return (
		<span
			className={`font-serif italic tracking-tight ${className ?? ""}`}
			style={{ color: "oklch(0.58 0.19 8)" }}
		>
			{BRAND_NAME}
		</span>
	);
}
