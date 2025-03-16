# **📖 Documentação - Web Scraper para Yupoo**

## **📌 Descrição**
Este projeto é um **web scraper** desenvolvido em **Node.js** com **Selenium WebDriver** para capturar **screenshots das imagens grandes** dos álbuns do **Yupoo**.  
O scraper acessa a página principal da loja, coleta os links dos álbuns, acessa cada um deles, **tira screenshots das imagens maiores** e salva **em pastas nomeadas com os nomes dos produtos**.

---

## **📂 Estrutura do Projeto**
```
public/
│── scraping.js         # Código principal do web scraper
│── package.json        # Configuração do Node.js
│── README.md           # Documentação do projeto
│── produtos/     # Pasta onde as imagens capturadas serão salvas
│   │── Nome-do-Produto-1/
│   │   ├── imagem_1.png
│   │   ├── imagem_2.png
│   │── Nome-do-Produto-2/
│   │   ├── imagem_1.png
│   │   ├── imagem_2.png
```

---

## **🛠️ Tecnologias Utilizadas**
- **Node.js** → Plataforma para rodar JavaScript no backend
- **Selenium WebDriver** → Biblioteca para automação do navegador
- **ChromeDriver** → Driver do Chrome para controle via Selenium
- **fs-extra** → Biblioteca para manipulação de arquivos

---

## **📦 Instalação**
### **1️⃣ Clonar o Repositório**
```sh
git clone https://github.com/adalbertocarv/webScrapingLojaVirtual.git
cd yupoo-scraper
```

### **2️⃣ Instalar Dependências**
```sh
npm install
```
Caso necessário, instale o ChromeDriver:
```sh
npm install chromedriver --save
```

---

## **🚀 Como Executar**
```sh
node scraping.js
```
O scraper abrirá o navegador em **modo headless**, coletará os links dos álbuns, capturará **screenshots apenas das imagens grandes** e salvará em **pastas nomeadas com os nomes dos produtos**.

---

## **⚙️ Como Funciona?**
### **1️⃣ Acessa a Página Inicial**
O scraper acessa a **página de álbuns da Yupoo** e coleta todos os links e títulos:
```javascript
const produtos = await driver.findElements(By.css("a.album__main"));
let albuns = [];

for (let produto of produtos) {
    let link = await produto.getAttribute("href");
    let nome = await produto.getAttribute("title"); // Obtém o nome do álbum
    nome = nome.replace(/[<>:"\/\\|?*]+/g, ""); // Remove caracteres inválidos
    albuns.push({ nome, link });
}
```

---

### **2️⃣ Captura Apenas Screenshots das Imagens Grandes**
1. **Clica na miniatura para abrir a versão maior**
```javascript
await driver.executeScript("arguments[0].click();", botoesVerDetalhe[idx]);
await driver.sleep(3000);
```
2. **Espera a imagem grande carregar**
```javascript
await driver.wait(until.elementLocated(By.css("div.viewer__imagewrap img.viewer__img")), 10000);
```
3. **Captura e salva o screenshot da imagem grande**
```javascript
let imgGrandeElement = await driver.findElement(By.css("div.viewer__imagewrap img.viewer__img"));
let imgGrandePath = path.join(produtoDir, `imagem_${idx + 1}.png`);
await imgGrandeElement.takeScreenshot().then((data) => {
    fs.writeFileSync(imgGrandePath, data, "base64");
});
```

---

### **3️⃣ Organiza as Imagens em Pastas com os Nomes dos Produtos**
Cada álbum será salvo em uma **pasta nomeada com o nome do produto**, garantindo organização:
```javascript
const produtoDir = path.join(outputDir, nome);
fs.ensureDirSync(produtoDir);
```
Isso gera a seguinte estrutura:
```
produtos/
│── 25-26 Flamengo Pre-match Jersey/
│   ├── imagem_1.png
│   ├── imagem_2.png
│── 25-26 PLAYER Flamengo Home/
│   ├── imagem_1.png
│   ├── imagem_2.png
```

---

## **📌 Personalização**
### **✅ Alterar a Quantidade de Álbuns a Capturar**
O script por padrão captura **5 álbuns**, mas você pode mudar esse número aqui:
```javascript
for (let index = 0; index < Math.min(5, albuns.length); index++) {
```
Altere **5** para o número desejado.

### **✅ Modificar Tempo de Espera**
Se as imagens demorarem para carregar, aumente o tempo de espera:
```javascript
await driver.sleep(3000); // 3 segundos
```

---

## **🔍 Possíveis Erros e Soluções**
| Erro | Solução |
|------|---------|
| `chromedriver not found` | Execute `npm install chromedriver --save` |
| `ElementClickInterceptedError` | Aumente `await driver.sleep(3000);` para `await driver.sleep(5000);` |
| `TimeoutError: Waiting for element...` | Verifique se os seletores CSS ainda são válidos |

---

## **📜 Licença**
Este projeto é distribuído sob a licença **MIT**.

---

## **🎯 Conclusão**
Este **web scraper** captura **apenas as imagens grandes** dos álbuns do **Yupoo** e as organiza em pastas nomeadas corretamente. Ele pode ser expandido para:
- **Baixar imagens diretamente**.
- **Capturar informações adicionais dos produtos**.
- **Integrar com um banco de dados ou API**.

Agora você pode rodar o scraper e capturar todas as imagens que precisar! 🚀