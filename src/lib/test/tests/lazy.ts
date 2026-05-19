import { TestType, type LazyTest } from "$lib/types/test";

const lazyPluginSpecs = [
	[
		"return {",
		"\t{",
		'\t\t"folke/tokyonight.nvim",',
		'\t\tlazy = false,',
		'\t\tpriority = 1000,',
		"\t},",
		"}"
	],
	[
		"return {",
		"\t{",
		'\t\t"nvim-telescope/telescope.nvim",',
		'\t\tcmd = "Telescope",',
		'\t\tdependencies = { "nvim-lua/plenary.nvim" },',
		"\t},",
		"}"
	],
	[
		"return {",
		"\t{",
		'\t\t"nvim-treesitter/nvim-treesitter",',
		'\t\tbuild = ":TSUpdate",',
		'\t\tevent = { "BufReadPost", "BufNewFile" },',
		"\t},",
		"}"
	],
	[
		"return {",
		"\t{",
		'\t\t"williamboman/mason.nvim",',
		'\t\tcmd = "Mason",',
		"\t\tconfig = true,",
		"\t},",
		"}"
	]
];

const lazyDistractors = [
	"\t-- DELETE_ME: remove this fake option before the spec is valid",
	'\t\tenabled = false, -- DELETE_ME',
	'\t\tcond = false, -- DELETE_ME',
	'\t\t-- DELETE_ME: this line breaks the clean Lazy.nvim spec'
];

export const lazyTest: LazyTest = {
	type: TestType.LAZY,
	targetLine: lazyDistractors[0],
	targetPosition: 0,
	prompt: "Clean a Lazy.nvim plugin spec by deleting the DELETE_ME line.",
	tip: "Tip: search DELETE_ME with /DELETE_ME, then use dd to delete the whole line.",
	textBuffer: lazyPluginSpecs[0],
	joinCharacter: "\n",
	condition: (currentBuffer: string) => {
		if (currentBuffer.length === 0) return false;
		if (lazyTest.type !== TestType.LAZY) return false;

		return !currentBuffer.includes("DELETE_ME") && currentBuffer.includes("return {");
	},
	updateBuffer: () => {
		if (lazyTest.type !== TestType.LAZY) return;

		const spec = lazyPluginSpecs[Math.floor(Math.random() * lazyPluginSpecs.length)];
		lazyTest.targetLine = lazyDistractors[Math.floor(Math.random() * lazyDistractors.length)];
		lazyTest.targetPosition = Math.floor(Math.random() * (spec.length - 2)) + 1;
		lazyTest.textBuffer = [...spec];
		lazyTest.textBuffer.splice(lazyTest.targetPosition, 0, lazyTest.targetLine);
	}
};
