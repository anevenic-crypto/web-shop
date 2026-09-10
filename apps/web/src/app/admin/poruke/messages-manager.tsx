"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@web-shop/ui/components/badge";
import { Button } from "@web-shop/ui/components/button";

import { queryClient, trpc } from "@/utils/trpc";

function formatDate(date: string | Date) {
	return new Date(date).toLocaleString("sr-RS");
}

export default function MessagesManager() {
	const { data: messages, isLoading } = useQuery(
		trpc.contact.list.queryOptions(),
	);

	const markRead = useMutation(
		trpc.contact.markRead.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.contact.list.queryKey(),
				});
			},
		}),
	);

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Učitavanje...</p>;
	}

	if (!messages?.length) {
		return (
			<p className="text-muted-foreground text-sm">Još uvek nema poruka.</p>
		);
	}

	return (
		<div className="space-y-4">
			{messages.map((m) => (
				<div
					key={m.id}
					className="rounded-3xl border border-border bg-card p-6"
				>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="font-medium">
								{m.name}{" "}
								<span className="text-muted-foreground text-sm">
									({m.email})
								</span>
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								{formatDate(m.createdAt)}
							</p>
						</div>
						{!m.isRead ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => markRead.mutate({ id: m.id })}
							>
								Označi kao pročitano
							</Button>
						) : (
							<Badge variant="outline">Pročitano</Badge>
						)}
					</div>
					<p className="mt-3 text-sm">{m.message}</p>
				</div>
			))}
		</div>
	);
}
