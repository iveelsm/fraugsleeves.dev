import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import perfectionist from "eslint-plugin-perfectionist";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	{
		ignores: ["dist/", "node_modules/", ".astro/"],
	},
	{
		files: ["**/*.astro", "**/*.ts", "**/*.js"],
		plugins: {
			perfectionist,
		},
		rules: {
			"perfectionist/sort-imports": [
				"error",
				{
					type: "natural",
					order: "asc",
					newlinesBetween: 1,
					groups: [
						"style",
						"side-effect-style",
						"svg",
						"astro-builtin",
						"builtin",
						"external",
						"astro-components",
						"import",
					],
					customGroups: [
						{
							groupName: "astro-builtin",
							elementNamePattern: "^astro(:.+)?$",
						},
						{
							groupName: "astro-components",
							elementNamePattern: ".*\\.astro$",
						},
						{
							groupName: "svg",
							elementNamePattern: ".*\\.svg$",
						},
					],
				},
			],
		},
	},
	{
		files: ["src/scripts/**/*.js"],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
];
