import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceFiles = [
  join(__dirname, '../public/_redirects'),
  join(__dirname, '../public/netlify.toml'),
  join(__dirname, '../public/render.json')
];

const distDir = join(__dirname, '../dist');

console.log('📦 Copiando arquivos de configuração para dist/...');

sourceFiles.forEach(source => {
  if (existsSync(source)) {
    const filename = source.split('/').pop().split('\\').pop();
    const dest = join(distDir, filename);
    try {
      copyFileSync(source, dest);
      console.log(`✅ Copiado: ${filename}`);
    } catch (error) {
      console.error(`❌ Erro ao copiar ${filename}:`, error.message);
    }
  }
});

console.log('✅ Post-build concluído!');
