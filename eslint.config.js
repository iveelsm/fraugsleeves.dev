import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";

export default [
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	{
		ignores: ["dist/", "node_modules/", ".astro/"],
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
