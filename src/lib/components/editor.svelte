<script lang="ts">
	import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import Spinner from "./spinner.svelte";
	import type { Test } from "$lib/types/test";
	import { timer } from "$lib/stores/test/timer";
	import { testOver, testStarted } from "$lib/stores/test/status";
	import { scores } from "$lib/stores/test/scores";
	import { rounds } from "$lib/stores/test/rounds";
	import { editorTheme } from "$lib/editor/theme";
	import { BEGIN_TEST_LINE } from "$lib/test/constants";
	import { incrementTestsStarted, updateStats } from "$lib/db/update";
	import { ASCII_LOGO } from "$lib/editor/ascii";
	import type { Session } from "@supabase/supabase-js";
	import {
		fontSizeOptions,
		enableAsciiLogoOptions,
		enableWordWrapOptions,
		enableRelativeLinesOptions,
		fontSize,
		wordWrapEnabled,
		asciiLogoEnabled,
		relativeLinesEnabled
	} from "$lib/stores/settings/settings";

	export let session: Session | null;

	export let test: Test;
	export let testMode: string;
	export let testType: string;
	export let testTypeAmount: number;

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let editorContainer: HTMLElement;
	let monaco: typeof Monaco;

	let asciiLogo = enableAsciiLogoOptions[$asciiLogoEnabled] === "Yes" ? ASCII_LOGO : "";
	let vimMode: any;
	let targetDecorations: string[] = [];
	let liveSubstituteDecorations: string[] = [];
	let statusObserver: MutationObserver;
	let loaded: boolean = false;

	const dispatch = createEventDispatcher<{ testchange: Test }>();

	const updateTargetHighlights = () => {
		if (!editor || !monaco) return;

		const model = editor.getModel();
		if (!model || !test.highlightToken) {
			targetDecorations = editor.deltaDecorations(targetDecorations, []);
			return;
		}

		const matches = model.findMatches(test.highlightToken, false, false, true, null, true);
		const decorations = matches.map((match) => ({
			range: test.highlightLine
				? new monaco.Range(match.range.startLineNumber, 1, match.range.startLineNumber, 1)
				: match.range,
			options: test.highlightLine
				? {
						isWholeLine: true,
						className: "target-delete-line",
						glyphMarginClassName: "target-delete-glyph"
					}
				: {
						inlineClassName: "target-replace-token"
					}
		}));

		targetDecorations = editor.deltaDecorations(targetDecorations, decorations);
	};

	const readLiveSubstituteSearch = () => {
		const statusText = document.getElementById("status-bar")?.textContent?.trim() ?? "";
		const commandStart = statusText.lastIndexOf(":%s");
		if (commandStart === -1) return "";

		const command = statusText.slice(commandStart);
		const delimiter = command[3];
		if (!delimiter) return "";

		let escaped = false;
		let search = "";
		for (const character of command.slice(4)) {
			if (escaped) {
				search += character;
				escaped = false;
				continue;
			}

			if (character === "\\") {
				escaped = true;
				continue;
			}

			if (character === delimiter) break;
			search += character;
		}

		return search;
	};

	const updateLiveSubstituteHighlights = () => {
		if (!editor || !monaco) return;

		const model = editor.getModel();
		const liveSearch = readLiveSubstituteSearch();
		if (!model || !liveSearch) {
			liveSubstituteDecorations = editor.deltaDecorations(liveSubstituteDecorations, []);
			return;
		}

		const matches = model.findMatches(liveSearch, false, false, true, null, true);
		liveSubstituteDecorations = editor.deltaDecorations(
			liveSubstituteDecorations,
			matches.map((match) => ({
				range: match.range,
				options: {
					inlineClassName: "live-substitute-token",
					overviewRuler: {
						color: "rgba(250, 204, 21, 0.9)",
						position: monaco.editor.OverviewRulerLane.Center
					}
				}
			}))
		);
	};

	onMount(async () => {
		// Import monaco code editor
		const imports = (await import("$lib/editor/monaco")).default;
		monaco = imports.monaco;

		// Import editor theme
		monaco.editor.defineTheme("Theme", editorTheme);

		// Set editor creation event to set theme
		monaco.editor.onDidCreateEditor((_) => {
			monaco.editor.setTheme("Theme");
		});

		// Create editor & model to be displayed
		editor = monaco.editor.create(editorContainer, {
			value: [BEGIN_TEST_LINE, test.prompt, test.tip, asciiLogo].filter(Boolean).join("\n"),
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			automaticLayout: true,
			fontFamily: "Fira Code",
			fontSize: fontSizeOptions[$fontSize],
			wordWrap: enableWordWrapOptions[$wordWrapEnabled] === "Yes" ? "on" : "off",
			lineNumbers: enableRelativeLinesOptions[$relativeLinesEnabled] === "Yes" ? "relative" : "on",
			padding: {
				top: 12
			},
			find: {
				addExtraSpaceOnTop: false,
				autoFindInSelection: "never",
				seedSearchStringFromSelection: "never"
			},
			unicodeHighlight: {
				ambiguousCharacters: false
			}
		});
		const statusBar = document.getElementById("status-bar");

		// Initialize vim mode
		vimMode = imports.initVimMode(editor, statusBar);
		if (statusBar) {
			statusObserver = new MutationObserver(updateLiveSubstituteHighlights);
			statusObserver.observe(statusBar, { childList: true, characterData: true, subtree: true });
		}
		// Placeholder for :q
		(imports.VimMode as any).Vim.defineEx("quit", "q", () => {
			return;
		});

		loaded = true;
		let startTime: number;
		let triggeredByEditor = false;

		timer.setTimer(testTypeAmount);
		rounds.setRounds(testTypeAmount);

		editor.focus();
		editor.setPosition({ lineNumber: 1, column: 1 });
		updateTargetHighlights();

		editor.getModel()?.onDidChangeContent(async () => {
			updateLiveSubstituteHighlights();

			// User decides to end the test early
			(imports.VimMode as any).Vim.defineEx("quit", "q", async () => {
				if (!$testStarted) return;
				timer.clear();
				testOver.set(true);
				triggeredByEditor = true;
				editor.setValue(`Test cancelled!\n${BEGIN_TEST_LINE}\n${asciiLogo}`);
			});

			// Helper function for updating the editor contents via the
			// test object updateBuffer() method
			const updateEditorContents = () => {
				test.updateBuffer();
				dispatch("testchange", test);
				triggeredByEditor = true;
				editor.setValue(test.textBuffer.join(test.joinCharacter));
				updateTargetHighlights();
				updateLiveSubstituteHighlights();
			};

			// Helper function to reset timer, rounds, and scores
			const resetTestItems = () => {
				timer.clear();
				timer.setTimer(testTypeAmount);
				rounds.setRounds(testTypeAmount);
				scores.reset();
			};

			// Any first edit launches the mission. Do not force the cursor to be on the START line:
			// if the player clicks the prompt and types dd, we still start the real drill instead of
			// making them fight the onboarding text.
			if (!$testOver && !$testStarted) {
				resetTestItems();
				$testStarted = true;
				if (testType === "time") {
					timer.start(editor);
				}
				updateEditorContents();
				startTime = performance.now();
				if (session) await incrementTestsStarted();
				return;
			}

			// If changes were triggered by the editor, ignore
			if (triggeredByEditor) {
				triggeredByEditor = false;
				return;
			}

			// Test is over and user wants to play again
			if ($testOver && !editor.getValue().includes(BEGIN_TEST_LINE)) {
				$testOver = false;
				$testStarted = false;
				updateEditorContents();
				startTime = performance.now();
				return;
			}

			if ($testOver) {
				return;
			}

			let [score, total] = $scores;

			// The user has reached the end of the test
			// Case 1: test is type = "time"
			if (testType === "time" && $timer <= 0) {
				$testOver = true;
				const accuracy = !total ? "-.-" : ((score / total) * 100).toFixed(2);

				const scoreSummary = `Your score is ${score}/${total} for the ${testTypeAmount} seconds test`;
				const accuracySummary = `Your accuracy was ${accuracy}%`;

				triggeredByEditor = true;
				editor.setValue(`${scoreSummary}\n${accuracySummary}\n${BEGIN_TEST_LINE}\n${asciiLogo}`);
				if (session) await updateStats(testMode, score, total, testTypeAmount);
				return;
			}

			// Check if we count it as a success or failure
			// In either case, increment the total count
			if (test.condition(editor.getValue())) {
				scores.incrementScore();
			}
			scores.incrementTotal();

			rounds.updateRounds();

			[score, total] = $scores;

			// Case 2: test is type = "rounds"
			if (testType === "rounds" && total >= testTypeAmount) {
				$testOver = true;
				const endTime = performance.now();
				const totalTime = ((endTime - startTime) / 1000).toFixed(2);
				const accuracy = ((score / total) * 100).toFixed(2);

				const scoreSummary = `Your score is ${score}/${total}`;
				const accuracySummary = `Your accuracy was ${accuracy}%`;
				const timeSummary = `Total time = ${totalTime} seconds`;

				triggeredByEditor = true;
				editor.setValue(
					`${scoreSummary}\n${timeSummary}\n${accuracySummary}\n${BEGIN_TEST_LINE}\n${ASCII_LOGO}`
				);
				if (session) await updateStats(testMode, score, total, parseFloat(totalTime));
				return;
			}

			// Update buffer and set it as the new editor value
			updateEditorContents();
		});
	});

	onDestroy(() => {
		statusObserver?.disconnect();
		monaco?.editor.getModels().forEach((model) => model.dispose());
		if (vimMode) vimMode.dispose();
		editor?.dispose();
	});
</script>

{#if !loaded}
	<div class="grid justify-center">
		<Spinner />
	</div>
{/if}

<div class="h-full w-full" bind:this={editorContainer}></div>
<div class="flex flex-col md:flex-row md:items-center md:justify-between">
	<p
		class="mb-4 mt-1 max-w-max rounded-lg bg-background-400 px-2 text-foreground-blue"
		id="status-bar"
	></p>
	<p class="text-sm">Tip: You can reset tests by using :q</p>
</div>

<style>
	:global(.target-delete-line) {
		background: linear-gradient(90deg, rgba(239, 68, 68, 0.32), rgba(251, 191, 36, 0.16));
		border-left: 3px solid rgb(248, 113, 113);
	}

	:global(.target-delete-glyph) {
		background: rgb(248, 113, 113);
		border-radius: 999px;
		margin-left: 4px;
		width: 8px !important;
	}

	:global(.target-replace-token) {
		background: rgba(250, 204, 21, 0.42);
		outline: 1px solid rgba(253, 224, 71, 0.9);
		border-radius: 3px;
		box-shadow: 0 0 14px rgba(250, 204, 21, 0.38);
	}

	:global(.live-substitute-token) {
		background: rgba(250, 204, 21, 0.55);
		outline: 2px solid rgba(253, 224, 71, 0.95);
		border-radius: 3px;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.55),
			0 0 16px rgba(250, 204, 21, 0.45);
		color: #020617 !important;
	}
</style>
