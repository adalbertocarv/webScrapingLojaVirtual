const fs = require('fs-extra');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuração do Selenium
const options = new chrome.Options();
options.addArguments("--headless=new"); // Modo headless atualizado
options.addArguments("--disable-gpu");
options.addArguments("--disable-software-rasterizer");
options.addArguments("--disable-extensions");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");
options.addArguments("--remote-debugging-port=9222");
options.addArguments("--blink-settings=imagesEnabled=true"); // Garantir que as imagens carreguem

(async function scrapYupoo() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // URL da página principal com os álbuns
        const base_url = "https://hsquan996.x.yupoo.com/albums?tab=gallery";

        // Criar diretório para salvar as imagens
        const outputDir = "yupoo_screenshots";
        fs.ensureDirSync(outputDir);

        console.log("\n Acessando a página inicial...");
        await driver.get(base_url);
        await driver.sleep(3000);

        // Coletar os links de cada álbum
        const produtos = await driver.findElements(By.css("a.album__main"));
        let prodLinks = [];

        for (let produto of produtos) {
            let link = await produto.getAttribute("href");
            prodLinks.push(link);
        }

        console.log(`Encontrados ${prodLinks.length} álbuns.`);

        // Limitar para os primeiros 5 álbuns
        for (let index = 0; index < Math.min(5, prodLinks.length); index++) {
            let link = prodLinks[index];
            console.log(`\n - Acessando álbum ${index + 1}/5: ${link}`);

            try {
                await driver.get(link);
                await driver.sleep(3000);

                // **1️ Simular Scroll para carregar todas as imagens**
                await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                await driver.sleep(3000);

                // **2️ Esperar o carregamento completo das miniaturas**
                await driver.wait(until.elementsLocated(By.css("img.image__img")), 10000);

            } catch (e) {
                console.error(`Erro ao acessar ${link}: ${e}`);
                continue;
            }

            // Criar pasta para cada álbum
            const produtoNome = `album_${index + 1}`;
            const produtoDir = path.join(outputDir, produtoNome);
            fs.ensureDirSync(produtoDir);

            // **3️ Capturar Screenshots das Miniaturas**
            let imagens = await driver.findElements(By.css("img.image__img"));

            for (let idx = 0; idx < imagens.length; idx++) {
                try {
                    // **Captura a miniatura**
                    let imgPath = path.join(produtoDir, `screenshot_miniatura_${idx + 1}.png`);
                    await imagens[idx].takeScreenshot().then((data) => {
                        fs.writeFileSync(imgPath, data, "base64");
                    });

                    console.log(`✅ Screenshot da miniatura ${idx + 1} salva em: ${imgPath}`);

                    // **4️ Clicar na Miniatura para Abrir a Imagem Maior**
                    let botoesVerDetalhe = await driver.findElements(By.css("div.image__clickhandle"));
                    if (idx < botoesVerDetalhe.length) {
                        await driver.executeScript("arguments[0].click();", botoesVerDetalhe[idx]);
                        await driver.sleep(3000);

                        // **5️ Esperar a Imagem Grande Carregar no Layout Correto**
                        await driver.wait(until.elementLocated(By.css("div.viewer__imagewrap img.viewer__img")), 10000);

                        // **6️ Capturar Screenshot da Imagem Maior**
                        let imgGrandeElement = await driver.findElement(By.css("div.viewer__imagewrap img.viewer__img"));
                        let imgGrandePath = path.join(produtoDir, `screenshot_grande_${idx + 1}.png`);
                        await imgGrandeElement.takeScreenshot().then((data) => {
                            fs.writeFileSync(imgGrandePath, data, "base64");
                        });

                        console.log(`✅ Screenshot da imagem grande ${idx + 1} salva em: ${imgGrandePath}`);

                        // **7️ Fechar a Imagem Expandida**
                        let botaoFechar = await driver.findElement(By.css("a#viewer__close"));
                        await driver.executeScript("arguments[0].click();", botaoFechar);
                        await driver.sleep(2000);
                    }

                } catch (e) {
                    console.error(`Erro ao capturar screenshot ${idx + 1}: ${e}`);
                }
            }
        }

        console.log("\n Captura de imagens concluída!");

    } catch (e) {
        console.error("Erro geral:", e);
    } finally {
        await driver.quit();
    }
})();
