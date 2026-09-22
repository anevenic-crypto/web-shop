import ChatsManager from "./chats-manager";

export default function RazgovoriPage() {
	return (
		<div>
			<h1 className="mb-1 font-semibold text-xl">AI razgovori</h1>
			<p className="mb-4 text-muted-foreground text-sm">
				Šta kupci pitaju asistenta — korisno da vidite šta traže, a nemate.
			</p>
			<ChatsManager />
		</div>
	);
}
