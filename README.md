# **📖 Documentação - Web Scraper para Yupoo**
## **📌 Descrição**
Projeto é um **web scraper** desenvolvido em **Node.js** com **Selenium WebDriver**. Ele acessa a página da loja **Yupoo**, coleta os links dos álbuns, acessa cada um deles e captura **screenshots das imagens** disponíveis.

O scraper **navega automaticamente** pelos álbuns, tira **prints das miniaturas e imagens grandes**, e salva todas as capturas em **pastas organizadas**.

---

## **📂 Estrutura do Projeto**
```
yupoo_scraper/
│── scraping.js         # Código principal do web scraper
│── package.json        # Arquivo de configuração do Node.js
│── README.md           # Documentação do projeto
│── imagens-salvas/  # Pasta onde as imagens capturadas serão salvas
│   │── album_1/
│   │   ├── screenshot_miniatura_1.png
│   │   ├── screenshot_grande_1.png
│   │── album_2/
│   │   ├── screenshot_miniatura_1.png
│   │   ├── screenshot_grande_1.png
```

---

## **🛠️ Tecnologias Utilizadas**
- **Node.js** → Plataforma para executar JavaScript no backend
- **Selenium WebDriver** → Biblioteca para automação de navegador
- **ChromeDriver** → Driver para controlar o Google Chrome
- **fs-extra** → Biblioteca para manipulação de arquivos e diretórios

---

## **📦 Instalação**
### 1️⃣ **Clonar o repositório**
```sh
git clone https://github.com/seu-usuario/yupoo-scraper.git
cd yupoo-scraper
```

### 2️⃣ **Instalar as dependências**
```sh
npm install
```

Isso instalará:
- **selenium-webdriver** → Para automação do navegador
- **fs-extra** → Para manipulação de arquivos
- **chromedriver** → Driver para o Chrome

Se ainda não tiver o ChromeDriver instalado, execute:
```sh
npm install chromedriver --save
```

---

## **🚀 Como Executar**
Para rodar o scraper:
```sh
node scraping.js
```
Ele abrirá o navegador em **modo headless**, coletará os links dos álbuns e capturará **screenshots das imagens**.

---

## **⚙️ Como Funciona?**
### **1️⃣ Configuração do Selenium**
No início do código, configuramos o Selenium para rodar **em segundo plano** (`headless`), otimizando o desempenho:
```javascript
const options = new chrome.Options();
options.addArguments("--headless=new"); // Modo headless atualizado
options.addArguments("--disable-gpu");
options.addArguments("--disable-software-rasterizer");
options.addArguments("--disable-extensions");
options.addArguments("--disable-dev-shm-usage");
```

---

### **2️⃣ Acessando a Página Inicial**
O scraper acessa a **página de álbuns da Yupoo** e coleta todos os links:
```javascript
await driver.get(base_url);
await driver.sleep(3000);

const produtos = await driver.findElements(By.css("a.album__main"));
let prodLinks = [];

for (let produto of produtos) {
    let link = await produto.getAttribute("href");
    prodLinks.push(link);
}
```

---

### **3️⃣ Capturando Screenshots das Miniaturas**
Cada álbum tem várias imagens **miniaturas**, que são capturadas e salvas:
```javascript
let imagens = await driver.findElements(By.css("img.image__img"));

for (let idx = 0; idx < imagens.length; idx++) {
    let imgPath = path.join(produtoDir, `screenshot_miniatura_${idx + 1}.png`);
    await imagens[idx].takeScreenshot().then((data) => {
        fs.writeFileSync(imgPath, data, "base64");
    });

    console.log(`✅ Screenshot da miniatura ${idx + 1} salva em: ${imgPath}`);
}
```

---

### **4️⃣ Acessando a Imagem Maior**
Após clicar na miniatura, o Selenium espera a **imagem grande carregar**:
```javascript
let botoesVerDetalhe = await driver.findElements(By.css("div.image__clickhandle"));
await driver.executeScript("arguments[0].click();", botoesVerDetalhe[idx]);
await driver.sleep(3000);

await driver.wait(until.elementLocated(By.css("div.viewer__imagewrap img.viewer__img")), 10000);
```

---

### **5️⃣ Capturando a Imagem Maior**
O Selenium então **tira um print da imagem grande**:
```javascript
let imgGrandeElement = await driver.findElement(By.css("div.viewer__imagewrap img.viewer__img"));
let imgGrandePath = path.join(produtoDir, `screenshot_grande_${idx + 1}.png`);
await imgGrandeElement.takeScreenshot().then((data) => {
    fs.writeFileSync(imgGrandePath, data, "base64");
});

console.log(`✅ Screenshot da imagem grande ${idx + 1} salva em: ${imgGrandePath}`);
```

---

### **6️⃣ Fechando a Imagem e Continuando**
Antes de seguir para a próxima imagem, o Selenium **fecha a imagem expandida**:
```javascript
let botaoFechar = await driver.findElement(By.css("a#viewer__close"));
await driver.executeScript("arguments[0].click();", botaoFechar);
await driver.sleep(2000);
```

---

## **📌 Personalização**
### **✅ Definir a Quantidade de Álbuns**
Se quiser capturar mais álbuns, altere:
```javascript
for (let index = 0; index < Math.min(5, prodLinks.length); index++) {
```
Mude **5** para o número desejado.

---

### **✅ Alterar o Tempo de Espera**
O tempo de espera padrão é de **3 segundos**. Para aumentar/diminuir:
```javascript
await driver.sleep(3000); // 3 segundos
```

---

## **🔍 Possíveis Erros e Soluções**
| Erro | Solução |
|------|---------|
| `chromedriver not found` | Execute `npm install chromedriver --save` |
| `ElementClickInterceptedError` | O site pode estar carregando lentamente, aumente `await driver.sleep(3000);` |
| `TimeoutError: Waiting for element...` | Verifique se o seletor CSS das imagens ainda é válido |

---

## **📌 Contribuições**
Se quiser contribuir:
1. **Faça um Fork** do repositório
2. **Crie uma branch** para sua feature:
   ```sh
   git checkout -b minha-feature
   ```
3. **Faça commit das alterações**
   ```sh
   git commit -m "Adicionei uma nova feature"
   ```
4. **Envie para o repositório**
   ```sh
   git push origin minha-feature
   ```

---

## **📜 Licença**
Este projeto é distribuído sob a licença **MIT**.

---

## **🎯 Conclusão**
Este **web scraper** permite coletar **screenshots automaticamente** dos álbuns do **Yupoo** de maneira eficiente. Ele pode ser expandido para:
- **Baixar imagens automaticamente**.
- **Capturar informações adicionais (preço, descrição, etc.)**.
- **Integrar com uma API para armazenar dados**.

Agora você pode rodar o scraper e capturar todas as imagens que precisar! 🚀