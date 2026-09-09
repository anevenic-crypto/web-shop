export default function AmbientBackground({
	tall = false,
}: {
	tall?: boolean;
}) {
	return (
		<div
			aria-hidden
			className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${
				tall ? "h-[900px]" : "h-[560px]"
			}`}
		>
			<div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(55%_50%_at_50%_0%,oklch(0.93_0.03_14)_0%,transparent_70%)]" />
			<div className="absolute -top-24 -left-16 size-72 rounded-full bg-primary/20 blur-3xl" />
			<div className="absolute top-16 -right-16 size-64 rounded-full bg-accent/40 blur-3xl" />
			<div className="absolute top-[280px] left-1/3 size-56 rounded-full bg-[oklch(0.55_0.13_15)]/12 blur-3xl" />
			<div className="absolute top-[380px] -right-10 size-40 rounded-full bg-[oklch(0.7_0.09_350)]/25 blur-3xl" />
		</div>
	);
}
