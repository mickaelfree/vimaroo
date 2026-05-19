import { TestType, type MixedTest, type Test } from "$lib/types/test";
import { containersTest } from "./containers";
import { linesTest } from "./lines";
import { movementTest } from "./movement";
import { horizontalTest } from "./horizontal";
import { lazyTest } from "./lazy";
import { substituteTest } from "./substitute";

export let mixedTest: Test = {
	type: TestType.MIXED,
	targetLine: "",
	populateWord: "",
	targetCharacter: "",
	populateCharacter: "",
	targetPosition: 0,
	prompt:
		"A combination of all other tests (words, containers, lines, movement, Lazy.nvim, substitute) into one.",
	tip: "Tip: Good luck, it's pretty hard.",
	textBuffer: [],
	joinCharacter: "",
	condition: () => false,
	updateBuffer: () => {
		const testTypes = [
			TestType.HORIZONTAL,
			TestType.CONTAINERS,
			TestType.LINES,
			TestType.MOVEMENT,
			TestType.LAZY,
			TestType.SUBSTITUTE
		];
		const randomTest = testTypes[Math.floor(Math.random() * testTypes.length)];
		const savedUpdatedBuffer = mixedTest.updateBuffer;
		switch (randomTest) {
			case TestType.HORIZONTAL:
				horizontalTest.updateBuffer();
				mixedTest.type = horizontalTest.type;
				if (mixedTest.type !== TestType.HORIZONTAL) break;

				mixedTest.targetCharacter = horizontalTest.targetCharacter;
				mixedTest.populateWord = horizontalTest.populateWord;
				mixedTest.targetPosition = horizontalTest.targetPosition;
				mixedTest.textBuffer = horizontalTest.textBuffer;
				mixedTest.joinCharacter = horizontalTest.joinCharacter;
				mixedTest.condition = horizontalTest.condition;
				break;
			case TestType.CONTAINERS:
				containersTest.updateBuffer();
				mixedTest.type = containersTest.type;
				if (mixedTest.type !== TestType.CONTAINERS) break;

				mixedTest.textBuffer = containersTest.textBuffer;
				mixedTest.joinCharacter = containersTest.joinCharacter;
				mixedTest.condition = containersTest.condition;
				break;
			case TestType.LINES:
				linesTest.updateBuffer();
				mixedTest.type = linesTest.type;
				if (mixedTest.type !== TestType.LINES) break;

				mixedTest.targetLine = linesTest.targetLine;
				mixedTest.targetPosition = linesTest.targetPosition;
				mixedTest.textBuffer = linesTest.textBuffer;
				mixedTest.joinCharacter = linesTest.joinCharacter;
				mixedTest.condition = linesTest.condition;
				break;
			case TestType.MOVEMENT:
				movementTest.updateBuffer();
				mixedTest.type = movementTest.type;
				if (mixedTest.type !== TestType.MOVEMENT) break;

				mixedTest.targetCharacter = movementTest.targetCharacter;
				mixedTest.populateCharacter = movementTest.populateCharacter;
				mixedTest.targetPosition = movementTest.targetPosition;
				mixedTest.textBuffer = movementTest.textBuffer;
				mixedTest.joinCharacter = movementTest.joinCharacter;
				mixedTest.condition = movementTest.condition;
				break;
			case TestType.LAZY:
				lazyTest.updateBuffer();
				mixedTest.type = lazyTest.type;
				if (mixedTest.type !== TestType.LAZY) break;

				mixedTest.targetLine = lazyTest.targetLine;
				mixedTest.targetPosition = lazyTest.targetPosition;
				mixedTest.textBuffer = lazyTest.textBuffer;
				mixedTest.joinCharacter = lazyTest.joinCharacter;
				mixedTest.condition = lazyTest.condition;
				mixedTest.highlightToken = lazyTest.highlightToken;
				mixedTest.highlightLine = lazyTest.highlightLine;
				break;
			case TestType.SUBSTITUTE:
				substituteTest.updateBuffer();
				mixedTest.type = substituteTest.type;
				if (mixedTest.type !== TestType.SUBSTITUTE) break;

				mixedTest.textBuffer = substituteTest.textBuffer;
				mixedTest.joinCharacter = substituteTest.joinCharacter;
				mixedTest.condition = substituteTest.condition;
				mixedTest.highlightToken = substituteTest.highlightToken;
				mixedTest.highlightLine = substituteTest.highlightLine;
				(mixedTest as typeof mixedTest & { searchText: string; replaceText: string; expectedMatches: number }).searchText = substituteTest.searchText;
				(mixedTest as typeof mixedTest & { searchText: string; replaceText: string; expectedMatches: number }).replaceText = substituteTest.replaceText;
				(mixedTest as typeof mixedTest & { searchText: string; replaceText: string; expectedMatches: number }).expectedMatches = substituteTest.expectedMatches;
				break;
		}
		mixedTest.updateBuffer = savedUpdatedBuffer;
	}
} satisfies MixedTest;
