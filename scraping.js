const fs = require('fs-extra');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuração do Selenium
const options = new chrome.Options();
options.addArguments("--headless=new"); 
options.addArguments("--disable-gpu");
options.addArguments("--disable-software-rasterizer");
options.addArguments("--disable-extensions");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--disable-logging");
options.addArguments("--log-level=3");
options.addArguments("--remote-debugging-port=9222");
options.addArguments("--blink-settings=imagesEnabled=true");

(async function scrapLoja() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // URL da página principal com os álbuns
        const base_url = "https://hsquan996.x.yupoo.com/albums?tab=gallery";

        // Criar diretório para salvar as imagens
        const outputDir = "imagens-salvas";
        fs.ensureDirSync(outputDir);

        console.log("\n🌍 Acessando a página inicial...");
        await driver.get(base_url);
        await driver.sleep(3000);

        // Coletar os links e nomes dos álbuns
        const produtos = await driver.findElements(By.css("a.album__main"));
        let albuns = [];

        for (let produto of produtos) {
            let link = await produto.getAttribute("href");
            let nome = await produto.getAttribute("title"); // Obtém o nome do álbum
            nome = nome.replace(/[<>:"\/\\|?*]+/g, ""); // Remove caracteres inválidos no nome da pasta
            albuns.push({ nome, link });
        }

        console.log(`🔍 Encontrados ${albuns.length} álbuns.`);

        // Limitar para os primeiros 5 álbuns
        for (let index = 0; index < Math.min(5, albuns.length); index++) {
            let { nome, link } = albuns[index];
            console.log(`\n📂 Acessando álbum ${index + 1}/5: ${nome} - ${link}`);

            try {
                await driver.get(link);
                await driver.sleep(3000);

                // **1️⃣ Simular Scroll para carregar todas as imagens**
                await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
                await driver.sleep(3000);

                // **2️⃣ Esperar o carregamento completo das miniaturas**
                await driver.wait(until.elementsLocated(By.css("img.image__img")), 10000);

            } catch (e) {
                console.error(`❌ Erro ao acessar ${link}: ${e}`);
                continue;
            }

            // Criar pasta para o álbum com o nome do produto
            const produtoDir = path.join(outputDir, nome);
            fs.ensureDirSync(produtoDir);

            // **3️⃣ Capturar Screenshots das Imagens Grandes**
            let botoesVerDetalhe = await driver.findElements(By.css("div.image__clickhandle"));

            for (let idx = 0; idx < botoesVerDetalhe.length; idx++) {
                try {
                    // **4️⃣ Clicar na Miniatura para Abrir a Imagem Maior**
                    await driver.executeScript("arguments[0].click();", botoesVerDetalhe[idx]);
                    await driver.sleep(3000);

                    // **5️⃣ Esperar a Imagem Grande Carregar no Layout Correto**
                    await driver.wait(until.elementLocated(By.css("div.viewer__imagewrap img.viewer__img")), 10000);

                    // **6️⃣ Capturar Screenshot da Imagem Maior**
                    let imgGrandeElement = await driver.findElement(By.css("div.viewer__imagewrap img.viewer__img"));
                    let imgGrandePath = path.join(produtoDir, `imagem_${idx + 1}.png`);
                    await imgGrandeElement.takeScreenshot().then((data) => {
                        fs.writeFileSync(imgGrandePath, data, "base64");
                    });

                    console.log(`✅ Screenshot da imagem grande ${idx + 1} salva em: ${imgGrandePath}`);

                    // **7️⃣ Fechar a Imagem Expandida**
                    let botaoFechar = await driver.findElement(By.css("a#viewer__close"));
                    await driver.executeScript("arguments[0].click();", botaoFechar);
                    await driver.sleep(2000);

                } catch (e) {
                    console.error(`❌ Erro ao capturar screenshot ${idx + 1}: ${e}`);
                }
            }
        }

        console.log("\n🎉 Captura de imagens concluída!");

    } catch (e) {
        console.error("❌ Erro geral:", e);
    } finally {
        await driver.quit();
    }
})();
