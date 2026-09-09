export default function AmbientBackground({
	tall = false,
}: {
	tall?: boolean;
}) {
	return (
		<div
			aria-hidden
			className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${
				tall ? "h-[900px]" : "h-[520px]"
			}`}
		>
			<div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(55%_50%_at_50%_0%,oklch(0.93_0.03_14)_0%,transparent_70%)]" />
			<div className="absolute -top-24 -left-16 size-72 rounded-full bg-primary/20 blur-3xl" />
			<div className="absolute top-16 -right-16 size-64 rounded-full bg-accent/40 blur-3xl" />
		</div>
	);
}
