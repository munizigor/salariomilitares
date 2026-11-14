// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://militaresdf.com.br',
  // Gera sobre.html, privacidade.html etc., os mesmos endereços do site antigo.
  build: { format: 'file' },
  integrations: [sitemap()],
});
