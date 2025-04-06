// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'http://127.0.0.1:5000/',
	integrations: [mdx(), sitemap(), react()],
	vite: {
		build: {
			rollupOptions: {
				output: {
					entryFileNames: '[name]-[hash].js',
				},
			},
		},
	},
});