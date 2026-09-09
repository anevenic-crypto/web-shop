export function LipstickSmudge({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 200 90"
			fill="currentColor"
			className={className}
			aria-hidden
			role="presentation"
		>
			<path
				d="M5,65 Q35,-10 78,32 T158,8 Q182,2 195,22 Q162,45 118,28 Q78,12 48,48 Q28,70 5,65 Z"
				opacity={0.9}
			/>
			<path
				d="M20,58 Q45,10 80,35 T150,15"
				fill="none"
				stroke="currentColor"
				strokeWidth={3}
				strokeLinecap="round"
				opacity={0.35}
			/>
		</svg>
	);
}

export function KissMark({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 100 60"
			fill="currentColor"
			className={className}
			aria-hidden
			role="presentation"
		>
			<path d="M50 12 C42 2 22 2 16 16 C10 29 20 36 29 33 C25 41 29 49 38 46 C34 56 44 59 50 51 C56 59 66 56 62 46 C71 49 75 41 71 33 C80 36 90 29 84 16 C78 2 58 2 50 12 Z" />
		</svg>
	);
}

export function LashFlourish({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 100 60"
			fill="none"
			stroke="currentColor"
			strokeWidth={4}
			strokeLinecap="round"
			className={className}
			aria-hidden
			role="presentation"
		>
			<path d="M10 52 Q18 22 12 6" />
			<path d="M27 56 Q37 22 36 2" />
			<path d="M45 58 Q54 24 58 3" />
			<path d="M62 55 Q72 26 82 9" />
			<path d="M78 49 Q88 30 94 16" />
		</svg>
	);
}
