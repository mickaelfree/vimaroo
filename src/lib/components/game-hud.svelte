<script lang="ts">
	import Icon from "@iconify/svelte";
	import { testOver, testStarted } from "$lib/stores/test/status";
	import { timer } from "$lib/stores/test/timer";
	import { rounds } from "$lib/stores/test/rounds";
	import { scores } from "$lib/stores/test/scores";
	import { TestType, type SubstituteTest, type Test } from "$lib/types/test";

	export let test: Test;
	export let testMode: string;
	export let testType: string;
	export let testTypeAmount: number;

	const isSubstituteTest = (value: Test): value is SubstituteTest =>
		value.type === TestType.SUBSTITUTE && "searchText" in value && "replaceText" in value;

	const missionCopy: Record<string, { name: string; goal: string; win: string; keys: string[]; xp: string }> = {
		[TestType.HORIZONTAL]: {
			name: "Chasse aux symboles",
			goal: "Supprime le caractère spécial caché dans la ligne.",
			win: "La ligne doit redevenir une suite propre de mots.",
			keys: ["w", "b", "f{char}", "F{char}", "x"],
			xp: "+100 XP par cible propre"
		},
		[TestType.CONTAINERS]: {
			name: "Nettoyage de conteneur",
			goal: "Vide le contenu entre parenthèses, quotes ou accolades.",
			win: "Le contenant reste, son intérieur disparaît.",
			keys: ["di\"", "di(", "di{", "ci\""],
			xp: "+150 XP par objet maîtrisé"
		},
		[TestType.LINES]: {
			name: "Assassinat de ligne",
			goal: "Trouve la phrase parasite et supprime seulement cette ligne.",
			win: "Toutes les lignes restantes doivent être intactes.",
			keys: ["j", "k", "5j", "dd"],
			xp: "+120 XP par ligne clean"
		},
		[TestType.MOVEMENT]: {
			name: "Navigation 2D",
			goal: "Atteins le symbole isolé dans la grille et supprime-le.",
			win: "La grille doit ne contenir que des points.",
			keys: ["h", "j", "k", "l", "/", "x"],
			xp: "+100 XP par cible"
		},
		[TestType.LAZY]: {
			name: "Fix Lazy.nvim",
			goal: "Supprime la ligne rouge delete-me dans la spec plugin.",
			win: "La spec Lua doit rester valide et sans delete-me.",
			keys: ["/delete-me", "dd"],
			xp: "+200 XP par spec sauvée"
		},
		[TestType.SUBSTITUTE]: {
			name: "Refactor éclair",
			goal: "Remplace toutes les occurrences cyan par la nouvelle valeur.",
			win: "L'ancien texte disparaît, le nouveau apparaît partout.",
			keys: [":%s/old/new/g", "Enter"],
			xp: "+250 XP par refactor"
		},
		[TestType.MIXED]: {
			name: "Boss rush Vim",
			goal: "Lis la mission courante et choisis la bonne famille de commande.",
			win: "Enchaîne les drills sans casser le buffer.",
			keys: ["motion", "operator", "text object", ":ex"],
			xp: "+300 XP par round"
		}
	};

	$: activeMission = missionCopy[test.type] ?? missionCopy[TestType.MIXED];
	$: isSubstitute = isSubstituteTest(test);
	$: substituteSearch = isSubstituteTest(test) ? test.searchText : "";
	$: substituteReplace = isSubstituteTest(test) ? test.replaceText : "";
	$: substituteCommand = isSubstitute ? `:%s/${substituteSearch}/${substituteReplace}/g` : "";
	$: activeGoal = isSubstitute
		? `Remplace exactement « ${substituteSearch} » par « ${substituteReplace} » partout.`
		: activeMission.goal;
	$: activeKeys = isSubstitute ? [substituteCommand, "Enter"] : activeMission.keys;
	$: [score, total] = $scores;
	$: accuracy = total === 0 ? "100" : ((score / total) * 100).toFixed(0);
	$: progressValue = testType === "rounds" && testTypeAmount > 0 ? Math.min(100, (total / testTypeAmount) * 100) : 0;
	$: runLabel = testType === "time" ? `${testMode} · ${testTypeAmount}s sprint` : testType === "rounds" ? `${testMode} · ${testTypeAmount} rounds` : `${testMode} · zen training`;
</script>

<section class="hud-shell w-[min(1000px,90vw)] overflow-hidden rounded-2xl border border-emerald-300/25 bg-slate-950/90 shadow-xl shadow-emerald-950/20">
	<div class="grid gap-4 p-4 md:grid-cols-[1.15fr_0.85fr] md:p-5">
		<div>
			<div class="mb-2 flex flex-wrap items-center gap-2">
				<span class="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
					Mission
				</span>
				<span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
					{runLabel}
				</span>
				<span class="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
					{activeMission.xp}
				</span>
			</div>
			<h2 class="text-2xl font-black leading-tight text-white md:text-3xl">
				{activeMission.name}
			</h2>
			<p class="mt-2 text-base font-semibold text-slate-200">
				Objectif : {activeGoal}
			</p>
			{#if isSubstitute}
				<div class="mt-3 grid gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
					<div>
						<div class="text-xs font-bold uppercase tracking-widest text-cyan-300">Texte actuel</div>
						<code class="mt-1 block rounded bg-black/35 px-3 py-2 font-mono text-lg font-black text-cyan-50">{substituteSearch}</code>
					</div>
					<Icon icon="mdi:arrow-right-bold" class="hidden text-cyan-200 sm:block" width={28} />
					<div>
						<div class="text-xs font-bold uppercase tracking-widest text-emerald-300">À remplacer par</div>
						<code class="mt-1 block rounded bg-black/35 px-3 py-2 font-mono text-lg font-black text-emerald-100">{substituteReplace}</code>
					</div>
				</div>
				<p class="mt-2 text-sm font-bold text-cyan-100">
					Commande complète à taper : <code class="rounded bg-black/40 px-2 py-1 font-mono text-emerald-100">{substituteCommand}</code>
				</p>
			{/if}
			<p class="mt-1 text-sm text-slate-400">
				Condition de victoire : {activeMission.win}
			</p>
		</div>

		<div class="grid gap-3 rounded-xl border border-white/10 bg-black/25 p-4">
			<div class="grid grid-cols-3 gap-2 text-center">
				<div class="rounded-lg bg-white/5 p-2">
					<div class="text-xs uppercase tracking-widest text-slate-500">Score</div>
					<div class="text-xl font-black text-emerald-200">{score}</div>
				</div>
				<div class="rounded-lg bg-white/5 p-2">
					<div class="text-xs uppercase tracking-widest text-slate-500">Combo</div>
					<div class="text-xl font-black text-cyan-200">x{Math.max(1, score)}</div>
				</div>
				<div class="rounded-lg bg-white/5 p-2">
					<div class="text-xs uppercase tracking-widest text-slate-500">Précision</div>
					<div class="text-xl font-black text-fuchsia-200">{accuracy}%</div>
				</div>
			</div>

			<div class="flex items-center justify-between gap-3 text-sm">
				<span class="flex items-center gap-2 text-slate-300">
					<Icon icon="mdi:timer-outline" width={18} />
					{testType === "time" ? `${$timer}s restants` : testType === "rounds" ? `${$rounds} rounds restants` : "Mode libre"}
				</span>
				<span class="font-mono text-slate-400">{total}/{testType === "rounds" ? testTypeAmount : "∞"}</span>
			</div>
			<div class="h-2 overflow-hidden rounded-full bg-white/10">
				<div class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-fuchsia-400 transition-all" style={`width: ${testType === "rounds" ? progressValue : $testStarted ? 66 : 8}%`}></div>
			</div>
		</div>
	</div>

	<div class="border-t border-white/10 bg-black/20 px-4 py-3 md:px-5">
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div class="flex items-center gap-2 text-sm font-bold text-white">
				<Icon icon={$testStarted ? "mdi:controller-classic" : "mdi:keyboard-outline"} width={20} />
				{#if $testOver}
					Run terminée. Supprime la ligne de départ pour rejouer.
				{:else if $testStarted}
					Joue maintenant : nettoie la cible, le score monte à chaque réussite.
				{:else}
					Pour commencer : clique dans l'éditeur puis tape <code class="rounded bg-emerald-300/15 px-2 py-0.5 font-mono text-emerald-100">dd</code>
				{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				{#each activeKeys as key}
					<code class="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 font-mono text-xs text-cyan-100">{key}</code>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.hud-shell {
		background-image:
			radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.16), transparent 26rem),
			radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.12), transparent 22rem);
	}
</style>
