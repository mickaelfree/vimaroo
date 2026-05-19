<script lang="ts">
	import Icon from "@iconify/svelte";
	import { learningByTestType } from "$lib/test/learning";
	import { TestType, type Test } from "$lib/types/test";

	export let test: Test;
	export let selectedMode: string;

	let expanded = false;
	let lastPanelKey = "";

	$: learning = test.learning ?? learningByTestType[test.type] ?? learningByTestType[TestType.MIXED];
	$: modeLabel = test.type === TestType.MIXED ? selectedMode : test.type;
	$: panelKey = `${test.type}:${selectedMode}`;
	$: if (panelKey !== lastPanelKey) {
		lastPanelKey = panelKey;
		expanded = false;
	}
</script>

<section class="learning-shell w-[min(1000px,90vw)] overflow-hidden rounded-2xl border border-cyan-300/20 bg-background-600/80 shadow-2xl shadow-cyan-950/20 backdrop-blur">
	<div class="relative border-b border-white/10 p-5 md:p-6">
		<div class="absolute right-4 top-4 hidden rounded-full border border-cyan-300/30 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-200 md:block">
			{modeLabel}
		</div>
		<div class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-foreground-blue">
			<Icon icon="mdi:school-outline" width={18} />
			Comprendre le pourquoi
		</div>
		<h2 class="max-w-3xl text-2xl font-black leading-tight text-white md:text-3xl">
			{learning.title}
		</h2>
		<p class="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
			{learning.summary}
		</p>
		<button
			type="button"
			class="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
			on:click={() => (expanded = !expanded)}
		>
			<Icon icon={expanded ? "mdi:chevron-up" : "mdi:book-open-page-variant"} width={18} />
			{expanded ? "Réduire le codex" : "Ouvrir le codex: axiomes, historique, déductions"}
		</button>
	</div>

	{#if expanded}
		<div class="grid gap-4 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-6">
		<div class="grid gap-4">
			<article class="rounded-xl border border-emerald-300/20 bg-emerald-950/20 p-4">
				<div class="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-200">
					<Icon icon="mdi:console" width={18} />
					Commande du drill
				</div>
				<code class="block rounded-lg border border-emerald-300/20 bg-black/35 px-3 py-2 font-mono text-sm text-emerald-100">
					{learning.command}
				</code>
			</article>

			<article class="rounded-xl border border-blue-300/15 bg-blue-950/20 p-4">
				<div class="mb-2 flex items-center gap-2 text-sm font-bold text-blue-200">
					<Icon icon="mdi:brain" width={18} />
					Modèle mental
				</div>
				<p class="text-sm leading-6 text-slate-300">{learning.mentalModel}</p>
			</article>

			{#if learning.history}
				<article class="rounded-xl border border-amber-300/15 bg-amber-950/20 p-4">
					<div class="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
						<Icon icon="mdi:history" width={18} />
						Historique utile
					</div>
					<p class="text-sm leading-6 text-slate-300">{learning.history}</p>
				</article>
			{/if}
		</div>

		<div class="grid gap-4">
			<article class="rounded-xl border border-fuchsia-300/15 bg-fuchsia-950/20 p-4">
				<div class="mb-3 flex items-center gap-2 text-sm font-bold text-fuchsia-200">
					<Icon icon="mdi:axis-arrow" width={18} />
					Axiomes à retenir
				</div>
				<ul class="grid gap-2">
					{#each learning.axioms as axiom}
						<li class="flex gap-2 text-sm leading-6 text-slate-300">
							<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-300"></span>
							<span>{axiom}</span>
						</li>
					{/each}
				</ul>
			</article>

			<article class="rounded-xl border border-cyan-300/15 bg-cyan-950/20 p-4">
				<div class="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-200">
					<Icon icon="mdi:source-branch" width={18} />
					Ce que tu peux déduire ensuite
				</div>
				<div class="flex flex-wrap gap-2">
					{#each learning.transfer as command}
						<code class="rounded-full border border-cyan-300/20 bg-black/30 px-3 py-1 font-mono text-xs text-cyan-100">
							{command}
						</code>
					{/each}
				</div>
			</article>
		</div>
	</div>

		<div class="grid gap-4 border-t border-white/10 p-5 md:grid-cols-3 md:p-6">
			{#each learning.cards as card}
				<article class="rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.055]">
					<h3 class="mb-2 text-sm font-extrabold text-white">{card.title}</h3>
					<p class="text-sm leading-6 text-slate-300">{card.body}</p>
					{#if card.examples?.length}
						<div class="mt-3 grid gap-2">
							{#each card.examples as example}
								<code class="rounded-md border border-white/10 bg-black/25 px-2 py-1 font-mono text-xs text-slate-200">
									{example}
								</code>
							{/each}
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	.learning-shell {
		background-image:
			radial-gradient(circle at 10% 0%, rgba(34, 211, 238, 0.12), transparent 28rem),
			radial-gradient(circle at 90% 10%, rgba(168, 85, 247, 0.1), transparent 24rem);
	}
</style>
