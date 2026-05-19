type TypeMode = {
	type: string;
	variances: number[];
};

enum TestType {
	HORIZONTAL = "horizontal",
	CONTAINERS = "containers",
	LINES = "lines",
	MOVEMENT = "movement",
	LAZY = "lazy.nvim",
	SUBSTITUTE = "substitute",
	MIXED = "mixed"
}

type BaseTest = {
	prompt: string;
	tip?: string;
	highlightToken?: string;
	highlightLine?: boolean;
	textBuffer: string[];
	joinCharacter: string;
	condition: (currentBuffer: string) => boolean;
	updateBuffer: () => void;
};

interface HorizontalTest extends BaseTest {
	type: TestType.HORIZONTAL;
	targetCharacter: string;
	populateWord: string;
	targetPosition: number;
}

interface ContainersTest extends BaseTest {
	type: TestType.CONTAINERS;
}

interface LinesTest extends BaseTest {
	type: TestType.LINES;
	targetLine: string;
	targetPosition: number;
}

interface MovementTest extends BaseTest {
	type: TestType.MOVEMENT;
	targetCharacter: string;
	populateCharacter: string;
	targetPosition: number;
}

interface LazyTest extends BaseTest {
	type: TestType.LAZY;
	targetLine: string;
	targetPosition: number;
}

interface SubstituteTest extends BaseTest {
	type: TestType.SUBSTITUTE;
	searchText: string;
	replaceText: string;
	expectedMatches: number;
}

interface MixedTest extends BaseTest {
	type: TestType.MIXED;
	targetLine: string;
	populateWord: string;
	targetCharacter: string;
	populateCharacter: string;
	targetPosition: number;
}

type Test =
	| HorizontalTest
	| ContainersTest
	| LinesTest
	| MovementTest
	| LazyTest
	| SubstituteTest
	| MixedTest;

export { TestType };
export type {
	TypeMode,
	BaseTest,
	HorizontalTest,
	ContainersTest,
	LinesTest,
	MovementTest,
	LazyTest,
	SubstituteTest,
	MixedTest,
	Test
};
