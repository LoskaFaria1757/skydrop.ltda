# 🚀 SkyDrop.LTDA - Plataforma de Entregas por Drone

![Badge de Status](https://img.shields.io/badge/status-DEPLOY_CONCLUÍDO-blue?style=for-the-badge&logo=vercel)

![Badge de Licença](https://img.shields.io/badge/licença-MIT-green?style=for-the-badge)

Esta não é apenas uma landing page. É uma **simulação completa de uma plataforma de logística de ponta**, demonstrando uma interface de usuário moderna e um sistema interativo de planejamento de rotas em tempo real.
<br>
<p align="center">
<a href="https://LoskaFaria1757.github.io/Skydriver.ltda/index%201.html">
<img src="https://img.shields.io/badge/VER_A_DEMO_AO_VIVO-Click_Aqui-black?style=for-the-badge&logo=rocket&logoColor=white" alt="Ver a Demo ao Vivo">
</a>
</p>
<br>
<p align="center">
<img src="https://github.com/LoskaFaria1757/Skydriver.ltda/blob/main/skydrop-demo.gif?raw=true" alt="Demo da Aplicação em Ação">
</p>

---

## 📍 Sobre o Projeto

O objetivo? Criar um portfólio **matador** que vai além do "CRUD básico". Este projeto foi desenhado para demonstrar proficiência em:

* **JavaScript "Vanilla" (Puro):** Toda a interatividade, cálculos e lógica de UI/UX foram feitos sem frameworks, mostrando domínio da linguagem.

* **Integração de APIs de Terceiros:** Uso e manipulação da biblioteca `Leaflet.js` e do serviço de geocodificação `Nominatim` para criar uma ferramenta de mapa funcional.

* **UI/UX Moderno:** Design responsivo (mobile-first), com foco em uma experiência de usuário limpa, escura (*dark mode*) e intuitiva.

* **Performance:** Animações otimizadas usando `IntersectionObserver` para garantir que o *scroll* seja fluido.

---

## ✨ Features de Destaque

* 🗺️ **Planejador de Rotas Interativo:**

    * Busca de endereços de **Origem** e **Destino** (Geocoding).

    * Cálculo em tempo real de **Distância (km)**, **Tempo de Voo (min)** e **Custo (R$)**.

* 🤖 **Validação de Frota Inteligente:**

    * O sistema avisa ao usuário se o drone selecionado **não é adequado** para o peso ou distância da rota.

    * Calculadora de Drones interativa que filtra a frota disponível.

* 🎬 **Simulação de Voo (Modo Demo):**

    * Abre um modal com um mapa e **anima um ícone de drone** personalizado ao longo de uma rota simulada.

* 💬 **Integração com WhatsApp:**

    * Formulário de contato que captura os dados, formata uma mensagem profissional e a envia **diretamente para a API do WhatsApp**.

* 📱 **Design 100% Responsivo:**

    * Construído com CSS Grid e Flexbox para uma adaptação perfeita em desktops, tablets e celulares.

---

## 🛠️ Tech Stack & Ferramentas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Leaflet.js](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)

![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)

---

## 🚀 Começando

Este projeto é 100% front-end e não requer instalação.

1.  Clone o repositório:

    ```bash

    git clone [https://github.com/LoskaFaria1757/Skydriver.ltda.git](https://github.com/LoskaFaria1757/Skydriver.ltda.git)

    ```

2.  Acesse a pasta:

    ```bash

    cd Skydriver.ltda

    ```

3.  Abra o arquivo `index 1.html` no seu navegador e explore!

---

## 🧠 Desafios & Soluções (O "Making Of")

Um projeto é definido pelos problemas que ele resolve. Aqui estão os principais:
<details>
<summary><strong>Desafio 1: Busca de Endereços Instável (Callback Hell)</strong></summary>
<br>
<strong>Problema:</strong> O `geocoder.geocode()` usa *callbacks*. Ao buscar dois endereços (Origem e Destino), eu caía no "Callback Hell", tornando o código difícil de ler e impossível de tratar erros (ex: se só a Origem fosse encontrada, mas o Destino não).
<br><br>
<strong>Solução:</strong> Eu "promissifiquei" a função de callback, envolvendo-a em uma `new Promise()`. Isso me permitiu usar `Promise.all()` para buscar os dois endereços simultaneamente e ter um único bloco `.then()` para sucesso (se AMBOS forem encontrados) e um `.catch()` para falha (se QUALQUER UM falhar), informando ao usuário exatamente qual endereço deu erro.
</details>
<details>
<summary><strong>Desafio 2: Animação de Drone Suave sem Bibliotecas</strong></summary>
<br>
<strong>Problema:</strong> Eu precisava que o ícone do drone no modal se movesse suavemente pela linha da rota, sem usar uma biblioteca de animação de mapa (como o Leaflet.motion).
<br><br>
<strong>Solução:</strong> Usei **Interpolação Linear (Lerp)**. Com um `setInterval`, eu calculava o próximo "passo" do drone ao longo da rota (ex: `progresso += 0.01`). Usando a matemática de interpolação `(fim - inicio) * progresso + inicio`, eu descobria a `newLatLng` exata para o drone a cada 50ms e atualizava sua posição com `droneMarker.setLatLng(newLatLng)`.
</details>
<details>
<summary><strong>Desafio 3: Performance (Evitar "Lag" no Scroll)</strong></summary>
<br>
<strong>Problema:</strong> O site tem muitos cards e seções que precisam de animação. Aplicar todas de uma vez poderia causar "lag".
<br><br>
<strong>Solução:</strong> Usei a API `IntersectionObserver`. Em vez de disparar as animações de *fade-in* assim que a página carrega, o observador "assiste" à tela. A animação (`.classList.add('fade-in')`) só é disparada no exato momento em que o elemento (como um `.service-card`) entra no campo de visão do usuário, garantindo performance máxima.
</details>

---

## 👨‍💻 Autor

| [<img src="https://github.com/LoskaFaria1757.png?size=115" width="115"><br><sub>Lucas Geraldo Ribeiro de Faria</sub>](https://github.com/LoskaFaria1757) |

| :---: |

| **Lucas Geraldo Ribeiro de Faria** <br> (Seu Título, ex: Desenvolvedor Front-End) |

| [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/[SEU-LINKEDIN]/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/LoskaFaria1757) |
 
