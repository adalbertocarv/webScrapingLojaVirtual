import fs from 'fs';
import path from 'path';
import { Product } from '../types/product';

export function generateProductsData(): Product[] {
  const productsDir = path.join(process.cwd(), 'public', 'produtos');
  const products: Product[] = [];

  // Lê os diretórios dentro da pasta produtos
  const directories = fs.readdirSync(productsDir).filter(file => 
    fs.statSync(path.join(productsDir, file)).isDirectory()
  );

  directories.forEach((directory, index) => {
    const productPath = path.join(productsDir, directory);
    const images = fs.readdirSync(productPath)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => `/produtos/${directory}/${file}`);

    // Converte o nome do diretório para um nome mais amigável
    const name = directory
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    products.push({
      id: String(index + 1),
      name,
      directory,
      images,
    });
  });

  return products;
}