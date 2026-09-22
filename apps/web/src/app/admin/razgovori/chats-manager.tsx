"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@web-shop/ui/components/badge";
import { Button } from "@web-shop/ui/components/button";
import { useState } from "react";

import { queryClient, trpc } from "@/utils/trpc";

function formatDate(date: string | Date) {
	return new Date(date).toLocaleString("sr-RS");
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-2xl border border-border bg-card px-5 py-4">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-1 font-semibold text-2xl">{value}</p>
		</div>
	);
}

function Conversation({ id }: { id: string }) {
	const { data: messages, isLoading } = useQuery(
		trpc.chats.get.queryOptions({ id }),
	);
	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Učitavanje...</p>;
	}
	return (
		<div className="mt-4 space-y-2 border-border border-t pt-4">
			{messages?.map((m) => (
				<div
					key={m.id}
					className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
						m.role === "user"
							? "ml-auto bg-primary text-primary-foreground"
							: "mr-auto bg-muted"
					}`}
				>
					{m.content}
				</div>
			))}
		</div>
	);
}

export default function ChatsManager() {
	const [openId, setOpenId] = useState<string | null>(null);
	const { data: stats } = useQuery(trpc.chats.stats.queryOptions());
	const { data: conversations, isLoading } = useQuery(
		trpc.chats.list.queryOptions(),
	);

	const remove = useMutation(
		trpc.chats.remove.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: trpc.chats.list.queryKey() });
				queryClient.invalidateQueries({ queryKey: trpc.chats.stats.queryKey() });
			},
		}),
	);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-3 gap-3">
				<StatCard label="Ukupno razgovora" value={stats?.ukupnoRazgovora ?? 0} />
				<StatCard label="Danas" value={stats?.danas ?? 0} />
				<StatCard label="Ukupno poruka" value={stats?.ukupnoPoruka ?? 0} />
			</div>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Učitavanje...</p>
			) : !conversations?.length ? (
				<p className="text-muted-foreground text-sm">
					Još uvek nema razgovora. Kad kupci počnu da koriste chat, pojaviće se
					ovde.
				</p>
			) : (
				<div className="space-y-3">
					{conversations.map((c) => (
						<div
							key={c.id}
							className="rounded-3xl border border-border bg-card p-5"
						>
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">
										{c.preview || "(bez teksta)"}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{formatDate(c.updatedAt)}
										<Badge variant="outline" className="ml-2">
											{c.messageCount} poruka
										</Badge>
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setOpenId(openId === c.id ? null : c.id)}
									>
										{openId === c.id ? "Sakrij" : "Prikaži"}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => remove.mutate({ id: c.id })}
									>
										Obriši
									</Button>
								</div>
							</div>
							{openId === c.id && <Conversation id={c.id} />}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
