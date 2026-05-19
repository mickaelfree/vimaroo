<script lang="ts">
	import TestSettings from "$lib/components/test-settings.svelte";
	import { testOver, testStarted } from "$lib/stores/test/status";
	import {
		TEST_INDEX_KEY,
		MODE_INDEX_KEY,
		TIME_INDEX_KEY,
		ROUNDS_INDEX_KEY,
		selectedTestIndex,
		selectedModeIndex,
		selectedTimeIndex,
		selectedRoundsIndex
	} from "$lib/stores/test/options";
	import {
		fontSize,
		wordWrapEnabled,
		asciiLogoEnabled,
		relativeLinesEnabled
	} from "$lib/stores/settings/settings";
	import { testOptions, modeOptions, roundOptions, timeOptions } from "$lib/test/options";
	import Editor from "$lib/components/editor.svelte";
	import GameHud from "$lib/components/game-hud.svelte";
	import LearningPanel from "$lib/components/learning-panel.svelte";
	import { handleTestModeChange } from "$lib/test/tests";
	import type { Test } from "$lib/types/test";
	import { onDestroy, onMount } from "svelte";
	import { syncStoresToCookies } from "$lib/stores/persistent.js";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/stores";
	import { beforeNavigate } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import Icon from "@iconify/svelte";

	export let data;

	let playFlashAnimation = false;
	let transitionReady = false;
	onMount(() => (transitionReady = true));

	const flash = getFlash(page);
	beforeNavigate((navigation) => {
		($testStarted = false), ($testOver = false);
		if ($flash && navigation.from?.url.toString() != navigation.to?.url.toString()) {
			$flash = undefined;
		}
	});

	const unsubscribeAll = syncStoresToCookies({
		[TEST_INDEX_KEY]: selectedTestIndex,
		[MODE_INDEX_KEY]: selectedModeIndex,
		[TIME_INDEX_KEY]: selectedTimeIndex,
		[ROUNDS_INDEX_KEY]: selectedRoundsIndex
	});

	// Clean up
	onDestroy(unsubscribeAll);

	let testTypeAmount: number;
	let test: Test = handleTestModeChange(testOptions[$selectedTestIndex]);

	$: testMode = testOptions[$selectedTestIndex];
	$: typeMode = modeOptions[$selectedModeIndex];
	$: test = handleTestModeChange(testMode);

	$: if (modeOptions[$selectedModeIndex] === "time") {
		testTypeAmount = timeOptions[$selectedTimeIndex];
	} else if (modeOptions[$selectedModeIndex] === "rounds") {
		testTypeAmount = roundOptions[$selectedRoundsIndex];
	} else {
		testTypeAmount = 0;
	}

	test.updateBuffer();

	// Deteremines delay and how long the toast notification is on for
	$: if ($flash) {
		setTimeout(() => {
			playFlashAnimation = true;
			setTimeout(() => {
				playFlashAnimation = false;
			}, 5000);
		}, 500);
	}
</script>

{#if $flash && playFlashAnimation}
	<div
		transition:fly={{ y: 10, duration: 75 }}
		class="fixed bottom-12 right-8 z-9999 rounded-md bg-background-600 p-3"
	>
		<span>
			{#if $flash.type === "success"}
				<Icon
					inline
					icon="mdi:tick"
					class="inline rounded-[50%] border-2 border-green-500 text-green-500"
				/>
			{:else}
				<Icon
					inline
					icon="mdi:close"
					class="inline rounded-[50%] border-2 border-red-400 text-red-400"
				/>
			{/if}
		</span>
		<span>{$flash.message}</span>
		<button on:click={() => ($flash = undefined)}>
			<Icon class="ml-2 inline" width={18} icon="mdi:close" />
		</button>
	</div>
{/if}

<section class="grid items-center justify-center gap-6 md:gap-8">
	{#if !$testStarted || $testOver}
		{#if transitionReady}
			<div in:fade={{ duration: 50 }}>
				<TestSettings />
			</div>
		{/if}
	{/if}

	<GameHud {test} {testMode} testType={typeMode} {testTypeAmount} />

	<div class="h-[400px] w-[min(1000px,90vw)]">
		{#key [testMode, typeMode, testTypeAmount, $asciiLogoEnabled, $fontSize, $wordWrapEnabled, $relativeLinesEnabled]}
			<Editor
				{test}
				{testMode}
				testType={typeMode}
				{testTypeAmount}
				session={data.session}
				on:testchange={(event) => (test = event.detail)}
			/>
		{/key}
	</div>

	<LearningPanel {test} selectedMode={testMode} />
</section>
