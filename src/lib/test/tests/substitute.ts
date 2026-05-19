import { TestType, type SubstituteTest } from "$lib/types/test";

const substituteScenarios = [
	{
		searchText: "old-theme",
		replaceText: "tokyonight",
		buffer: [
			'vim.cmd.colorscheme("old-theme")',
			'require("old-theme").setup({ transparent = true })',
			'local fallback_theme = "old-theme"'
		]
	},
	{
		searchText: "leader",
		replaceText: "localleader",
		buffer: [
			'vim.g.mapleader = " "',
			'vim.keymap.set("n", "<leader>ff", "<cmd>Telescope find_files<cr>")',
			'vim.keymap.set("n", "<leader>fg", "<cmd>Telescope live_grep<cr>")'
		]
	},
	{
		searchText: "VeryLazy",
		replaceText: "BufReadPost",
		buffer: [
			'{ "nvim-treesitter/nvim-treesitter", event = "VeryLazy" },',
			'{ "folke/which-key.nvim", event = "VeryLazy" },',
			'{ "lewis6991/gitsigns.nvim", event = "VeryLazy" },'
		]
	},
	{
		searchText: "setup",
		replaceText: "opts",
		buffer: [
			'{ "folke/which-key.nvim", config = function() require("which-key").setup({}) end },',
			'{ "nvim-tree/nvim-tree.lua", config = function() require("nvim-tree").setup({}) end },'
		]
	}
];

const firstScenario = substituteScenarios[0];

function countMatches(value: string, searchText: string) {
	return value.split(searchText).length - 1;
}

export const substituteTest: SubstituteTest = {
	type: TestType.SUBSTITUTE,
	searchText: firstScenario.searchText,
	replaceText: firstScenario.replaceText,
	expectedMatches: firstScenario.buffer.join("\n").split(firstScenario.searchText).length - 1,
	prompt: `Remplace « ${firstScenario.searchText} » par « ${firstScenario.replaceText} » partout dans le fichier.`,
	tip: `Commande: :%s/${firstScenario.searchText}/${firstScenario.replaceText}/g puis Enter.`,
	highlightToken: firstScenario.searchText,
	highlightLine: false,
	textBuffer: firstScenario.buffer,
	joinCharacter: "\n",
	condition: (currentBuffer: string) => {
		if (currentBuffer.length === 0) return false;
		if (substituteTest.type !== TestType.SUBSTITUTE) return false;

		return (
			!currentBuffer.includes(substituteTest.searchText) &&
			countMatches(currentBuffer, substituteTest.replaceText) >= substituteTest.expectedMatches
		);
	},
	updateBuffer: () => {
		if (substituteTest.type !== TestType.SUBSTITUTE) return;

		const scenario = substituteScenarios[Math.floor(Math.random() * substituteScenarios.length)];
		substituteTest.searchText = scenario.searchText;
		substituteTest.replaceText = scenario.replaceText;
		substituteTest.expectedMatches = countMatches(scenario.buffer.join("\n"), scenario.searchText);
		substituteTest.prompt = `Remplace « ${scenario.searchText} » par « ${scenario.replaceText} » partout dans le fichier.`;
		substituteTest.tip = `Commande: :%s/${scenario.searchText}/${scenario.replaceText}/g puis Enter.`;
		substituteTest.highlightToken = scenario.searchText;
		substituteTest.highlightLine = false;
		substituteTest.textBuffer = [...scenario.buffer];
	}
};
