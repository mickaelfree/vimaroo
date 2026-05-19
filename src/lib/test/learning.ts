import { TestType, type TestLearning } from "$lib/types/test";

const horizontalLearning: TestLearning = {
	title: "Horizontal motions: bouger moins, viser mieux",
	summary:
		"Ce drill t'apprend à ne pas marteler h/l. Tu identifies une cible sur la ligne, puis tu utilises une motion courte comme w, b, f ou F.",
	command: "w / b / f{char} / F{char} puis x",
	mentalModel:
		"Vim sépare l'intention de l'action: d'abord une motion pour atteindre la cible, ensuite un opérateur comme x, d, c ou y.",
	axioms: [
		"Une motion est une coordonnée: elle dit où aller, pas quoi faire.",
		"f{char} cherche le prochain caractère sur la ligne; F fait la même chose vers la gauche.",
		"Quand une action marche avec d, elle marche souvent avec c et y: dw, cw, yw."
	],
	history:
		"Les touches hjkl viennent des terminaux ADM-3A utilisés par Bill Joy, créateur de vi. Les motions compactes existent parce que les éditeurs étaient pensés pour rester au clavier.",
	cards: [
		{
			title: "Pourquoi f s'appelle f ?",
			body: "f = find. Tu demandes à Vim de trouver un caractère sur la ligne courante.",
			examples: ["fa va au prochain a", "F= revient au précédent =", "; répète le dernier f/F/t/T"]
		},
		{
			title: "Pattern transférable",
			body: "Si tu connais f, tu peux deviner t: t = till, va juste avant le caractère. Très utile pour supprimer jusqu'à une virgule sans la manger.",
			examples: ["dt, supprime jusqu'avant la virgule", "df, supprime jusqu'à la virgule incluse"]
		}
	],
	transfer: ["ciw change inside word", "dw delete word", "yt) yank till )", "f{char}; pour répéter une chasse"]
};

const containersLearning: TestLearning = {
	title: "Text objects: penser en objets, pas en caractères",
	summary:
		"Ce drill entraîne les commandes comme di\" ou ci{. Tu ne comptes plus les caractères: tu dis à Vim quel objet éditer.",
	command: "di{ / di( / di\" / ci{ / ci\"",
	mentalModel:
		"Un text object est une zone logique: inside quotes, around brackets, inside paragraph. Opérateur + objet = édition précise.",
	axioms: [
		"d = delete, c = change, y = yank. L'opérateur est interchangeable.",
		"i = inside: garde le contenant. a = around: prend aussi le contenant.",
		"Le même modèle se décline: di\", da\", ci), ca), yi{."
	],
	history:
		"Les text objects ont rendu Vim très puissant pour le code: ils transforment la syntaxe en cibles éditables sans souris.",
	cards: [
		{
			title: "Pourquoi di\" veut dire delete inside quotes ?",
			body: "d est l'opérateur delete, i précise inside, \" choisit l'objet guillemets. La commande se lit comme une phrase.",
			examples: ["di\" supprime le contenu", "da\" supprime contenu + guillemets", "ci\" remplace le contenu"]
		},
		{
			title: "Déduction",
			body: "Si di\" existe, alors di(, di[, di{ existent aussi. Même grammaire, autre objet."
		}
	],
	transfer: ["ciw pour changer un mot", "dap pour supprimer un paragraphe", "yi{ pour copier un bloc Lua"]
};

const linesLearning: TestLearning = {
	title: "Line motions: supprimer une ligne sans viser au pixel",
	summary:
		"Ce drill travaille dd, les sauts relatifs et la navigation verticale. Le but est de supprimer la bonne ligne vite, sans souris.",
	command: "j/k / 5j / 3k / dd",
	mentalModel:
		"Une ligne est une unité de travail. Quand l'objet est toute la ligne, dd évite de sélectionner ou de déplacer le curseur jusqu'en fin de ligne.",
	axioms: [
		"dd = delete line; yy = yank line; cc = change line.",
		"Un nombre avant une motion répète la motion: 5j descend de 5 lignes.",
		"Les numéros relatifs transforment le mouvement vertical en calcul immédiat."
	],
	history:
		"Vi a été conçu pour des terminaux sans souris. Les commandes ligne comme dd sont devenues centrales parce qu'elles économisent énormément de frappes.",
	cards: [
		{
			title: "Pourquoi dd ?",
			body: "d attend une motion. Si tu répètes d, Vim comprend l'objet ligne entière: delete this line.",
			examples: ["dd supprime la ligne", "3dd supprime 3 lignes", "cc change la ligne"]
		},
		{
			title: "Déduction",
			body: "Le doublage d'un opérateur cible souvent la ligne: yy copie la ligne, cc remplace la ligne."
		}
	],
	transfer: ["3dd", "V puis d", ":g/pattern/d pour supprimer plusieurs lignes ciblées"]
};

const movementLearning: TestLearning = {
	title: "2D movement: lire le buffer comme une grille",
	summary:
		"Ce drill force le cerveau à passer de déplacement linéaire à navigation spatiale: haut/bas/gauche/droite, puis recherche quand c'est plus rentable.",
	command: "h j k l / /pattern / n / N",
	mentalModel:
		"hjkl sont les bases, mais le vrai gain vient du choix: petit déplacement = hjkl, cible visible = f/t, cible textuelle = recherche /.",
	axioms: [
		"h gauche, j bas, k haut, l droite.",
		"/ lance une recherche vers l'avant; n répète; N répète en sens inverse.",
		"La meilleure motion est celle qui minimise le nombre de décisions, pas seulement le nombre de touches."
	],
	history:
		"hjkl viennent du clavier ADM-3A où les flèches étaient imprimées sur ces touches. Vim a gardé cette ergonomie pour ne pas quitter la rangée de repos.",
	cards: [
		{
			title: "Pourquoi / pour chercher ?",
			body: "Dans vi, / est la recherche avant. C'est devenu un réflexe Unix: beaucoup d'outils utilisent / pour trouver dans une page.",
			examples: ["/TODO cherche TODO", "n occurrence suivante", "N occurrence précédente"]
		},
		{
			title: "Déduction",
			body: "Si / cherche vers l'avant, ? cherche vers l'arrière. Même logique, direction inverse."
		}
	],
	transfer: ["* cherche le mot sous le curseur", "# cherche le mot sous le curseur vers l'arrière", "% saute entre parenthèses/accolades"]
};

const lazyLearning: TestLearning = {
	title: "Lazy.nvim specs: nettoyer une config plugin comme un chirurgien",
	summary:
		"Ce drill te fait pratiquer une action réaliste: trouver une ligne parasite dans une spec Lazy.nvim et la supprimer proprement.",
	command: "/delete-me puis dd",
	mentalModel:
		"Tu combines recherche globale locale + action ligne. / localise l'intention, dd supprime l'unité entière. C'est plus rapide que naviguer à l'œil.",
	axioms: [
		"Lazy.nvim décrit les plugins avec des tables Lua: { \"auteur/plugin.nvim\", opts = {}, event = ... }.",
		"Dans Vim, opérateur + cible est la grammaire principale. Ici la cible est une ligne complète, donc dd.",
		"Une config Neovim est du code: supprimer la mauvaise ligne doit préserver la structure Lua autour."
	],
	history:
		"Lazy.nvim est devenu populaire dans l'écosystème Neovim moderne parce qu'il rend le chargement des plugins déclaratif et paresseux: on charge seulement quand un event, cmd ou keymap le demande.",
	cards: [
		{
			title: "Pourquoi lazy.nvim s'appelle Lazy ?",
			body: "Lazy = chargement paresseux. Un plugin peut être installé mais ne se charge qu'au moment utile: commande, fichier, événement ou raccourci.",
			examples: ["cmd = \"Telescope\" charge au lancement de :Telescope", "event = \"BufReadPost\" charge après ouverture d'un buffer", "keys = { \"<leader>ff\" } charge au raccourci"]
		},
		{
			title: "Pourquoi /delete-me puis dd ?",
			body: "/ saute directement au marqueur. dd supprime la ligne entière, indentation et commentaire inclus. C'est la combinaison recherche + opération ligne.",
			examples: ["/delete-me", "dd", "n puis dd si plusieurs lignes"]
		},
		{
			title: "Déduction Lazy.nvim",
			body: "Si cmd charge par commande et event par événement, alors keys charge par raccourci. Le nom de la propriété révèle le déclencheur."
		}
	],
	transfer: ["/pattern puis dd", ":g/delete-me/d", "ci{ dans opts = { ... }", "gf sur un chemin Lua"]
};

const substituteLearning: TestLearning = {
	title: "Substitute: remplacer partout sans micro-éditer",
	summary:
		"Ce drill entraîne :%s/search/replace/g, une des commandes les plus rentables de Vim pour refactorer vite.",
	command: ":%s/ancien/nouveau/g",
	mentalModel:
		"La commande se lit: sur la plage %, substitute ancien par nouveau, globalement sur chaque ligne.",
	axioms: [
		": entre en commande Ex, le langage historique de vi pour agir sur le fichier.",
		"% veut dire toutes les lignes du fichier. Sans %, :s agit seulement sur la ligne courante.",
		"g veut dire global sur la ligne: remplacer toutes les occurrences de chaque ligne, pas seulement la première."
	],
	history:
		":s vient de l'éditeur Unix sed et de la famille ed/ex. Vim hérite de cette grammaire: plage + commande + pattern + remplacement + flags.",
	cards: [
		{
			title: "Pourquoi :%s/foo/bar/g est structuré comme ça ?",
			body: "':' ouvre Ex. '%' sélectionne tout le fichier. 's' signifie substitute. Les slashs séparent recherche et remplacement. 'g' applique à toutes les occurrences par ligne.",
			examples: [":s/foo/bar/ ligne courante, première occurrence", ":%s/foo/bar/g tout le fichier", ":%s/foo/bar/gc avec confirmation"]
		},
		{
			title: "Déduction",
			body: "Si % est une plage, tu peux remplacer sur une sélection visuelle ou sur quelques lignes: :'<,'>s/foo/bar/g ou :10,20s/foo/bar/g."
		},
		{
			title: "Axiome regex",
			body: "La partie search est un pattern, pas toujours un texte brut. Quand tu maîtrises ça, tu peux cibler des familles de code, pas juste des mots."
		}
	],
	transfer: [":%s/old/new/gc", ":10,20s/old/new/g", ":g/pattern/s/old/new/g", ":v/pattern/d"]
};

const mixedLearning: TestLearning = {
	title: "Mixed dojo: choisir la bonne grammaire au bon moment",
	summary:
		"Le mode mixed mélange les réflexes. L'objectif n'est pas de connaître une commande, mais de choisir rapidement la meilleure famille de commande.",
	command: "motion + operator + text object + Ex command",
	mentalModel:
		"Vim est une langue. Les exercices sont des phrases: verbe d/c/y, objet i\"/iw/line, motion f/w//, portée %/range.",
	axioms: [
		"Opérateur + motion: dw, d$, cgn.",
		"Opérateur + text object: di\", ci{, yap.",
		"Plage + commande Ex: :%s, :g, :10,20normal."
	],
	history:
		"Vim combine vi, ex et des extensions modernes. Sa puissance vient du fait que les anciennes commandes composables restent valables dans le code moderne.",
	cards: [
		{
			title: "Le noyau",
			body: "Ne mémorise pas 100 commandes isolées. Mémorise la grammaire: verbe + cible. Ensuite tu déduis."
		},
		{
			title: "Exemple de déduction",
			body: "Si d supprime et y copie, alors après avoir appris diw, tu peux deviner yiw et ciw."
		}
	],
	transfer: ["daw", "ci\"", ":%s", ":g/pattern/d", "qa...q puis @a"]
};

export const learningByTestType: Record<TestType, TestLearning> = {
	[TestType.HORIZONTAL]: horizontalLearning,
	[TestType.CONTAINERS]: containersLearning,
	[TestType.LINES]: linesLearning,
	[TestType.MOVEMENT]: movementLearning,
	[TestType.LAZY]: lazyLearning,
	[TestType.SUBSTITUTE]: substituteLearning,
	[TestType.MIXED]: mixedLearning
};
