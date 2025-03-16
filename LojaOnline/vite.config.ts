import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { generateProductsData } from './src/utils/productLoader';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-products',
      configureServer(server) {
        const productsDir = path.join(process.cwd(), 'public', 'produtos');

        // Função para atualizar os produtos
        const updateProducts = () => {
          const products = generateProductsData();
          const content = `import { Product } from '../types/product';\n\nexport const products: Product[] = ${JSON.stringify(products, null, 2)};`;
          fs.writeFileSync('./src/data/products.ts', content);
          // Recarrega todos os módulos que dependem de products.ts
          server.ws.send({ type: 'full-reload' });
        };

        // Observa mudanças na pasta produtos
        try {
          if (fs.existsSync(productsDir)) {
            fs.watch(productsDir, { recursive: true }, (eventType, filename) => {
              if (filename) {
                updateProducts();
              }
            });
          } else {
            console.warn('Pasta produtos não encontrada. Criando...');
            fs.mkdirSync(productsDir, { recursive: true });
          }
        } catch (err) {
          console.error('Erro ao observar pasta de produtos:', err);
        }

        // Gera produtos iniciais
        updateProducts();
      },
      buildStart() {
        // Gera o arquivo de produtos durante o build
        const products = generateProductsData();
        const content = `import { Product } from '../types/product';\n\nexport const products: Product[] = ${JSON.stringify(products, null, 2)};`;
        fs.writeFileSync('./src/data/products.ts', content);
      },
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});