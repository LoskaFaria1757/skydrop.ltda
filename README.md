# 🚀 SkyDrop.LTDA - Landing Page de Entregas por Drone

![Status do Projeto](https://img.shields.io/badge/status-Concluído-blue)

![Licença](https://img.shields.io/badge/licença-MIT-brightgreen)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

Uma landing page moderna e totalmente responsiva para a "SkyDrop.LTDA", um serviço fictício de entregas por drone. O projeto é focado em UI/UX, interatividade com JavaScript puro e integração com a API de mapas Leaflet.js para planejamento de rotas em tempo real.

![Print da Tela do SkyDrop](https://github.com/[SEU-USUARIO]/[SEU-REPOSITORIO]/blob/main/seu-print-de-tela.png?raw=true)

<p align="center">
<img src="https://github.com/[SEU-USUARIO]/[SEU-REPOSITORIO]/blob/main/skydrop-demo.gif?raw=true" alt="Demo da Aplicação em Ação">
</p>

*(Substitua este link por um print do seu projeto)*

### 🔗 [Ver Demo Ao Vivo](https://[SEU-USUARIO].github.io/[SEU-REPOSITORIO]/index%201.html)

---

## 📋 Tabela de Conteúdos

1. [Sobre o Projeto](#-sobre-o-projeto)

2. [Funcionalidades Principais](#-funcionalidades-principais)

3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)

4. [Como Executar](#-como-executar)

5. [Destaques do Código](#-destaques-do-código)

6. [Licença](#-licença)

---

## 📖 Sobre o Projeto

Este projeto foi criado para simular uma landing page completa e funcional para uma startup de tecnologia. O principal desafio era criar uma interface atraente (em *dark mode*) e integrar um mapa totalmente funcional para planejamento de rotas, dando ao usuário uma experiência interativa real, desde o cálculo de frete até a simulação de entrega.

---

## ✨ Funcionalidades Principais

* **Design Responsivo:** Interface adaptável para desktops, tablets e celulares, construída com CSS Grid e Flexbox.

* **Mapa Interativo (Leaflet.js):** Seção "Planejamento de Rotas" que permite ao usuário:

* **Buscar Endereços:** Geocodificação de origem e destino usando o plugin *Leaflet-Control-Geocoder* (via Nominatim/OpenStreetMap).

* **Cálculo em Tempo Real:** Calcula automaticamente a distância (km), tempo de voo (min) e custo (R$) da entrega.

* **Validação de Frota:** Informa ao usuário qual drone é adequado para a rota com base no peso do pacote e na distância.

* **Calculadora de Frota:** Filtra dinamicamente os drones disponíveis com base no peso e distância inseridos pelo usuário.

* **Modal de Simulação:** Um "Modo Demo" que abre um modal e anima um ícone de drone personalizado ao longo de uma rota simulada no mapa.

* **Formulário para WhatsApp:** O formulário de contato captura os dados, formata uma mensagem e a envia diretamente para o WhatsApp Business da empresa.

* **Abas (Tabs):** Seção "Casos de Uso" com abas interativas em JavaScript puro para exibir diferentes setores (Restaurantes, Farmácias, E-commerce).

* **Animações CSS:** Efeitos de *fade-in* suaves nos cards e estatísticas conforme o usuário rola a página, implementados com `IntersectionObserver`.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

| Ferramenta | Descrição |

| :--- | :--- |

| **HTML5** | Estrutura semântica e moderna para o conteúdo da página. |

| **CSS3** | Estilização avançada, utilizando Variáveis CSS, Grid, Flexbox e Animações. |

| **JavaScript (ES6+)** | Linguagem principal para toda a interatividade, manipulação do DOM e lógica de negócio. |

| **Leaflet.js** | Biblioteca open-source líder para mapas interativos e móveis. |

| **Leaflet-Control-Geocoder** | Plugin para conectar o Leaflet ao serviço de geocodificação Nominatim. |

| **WhatsApp API** | Utilização do link `wa.me` para envio de mensagens pré-formatadas do formulário de contato. |

---

## 🚀 Como Executar

Este é um projeto puramente front-end (estático) e não requer instalação de dependências.

1.  Clone o repositório:

```bash

git clone https://github.com/[SEU-USUARIO]/[SEU-REPOSITORIO].git

```

2.  Acesse a pasta do projeto:

```bash

cd [SEU-REPOSITORIO]

```

3.  Abra o arquivo `index 1.html` em qualquer navegador web.

---

## 💡 Destaques do Código

Abaixo estão algumas seções do código que foram cruciais para o projeto:

### 1. Busca de Rota Robusta com Promises

Para evitar problemas de *callback* e garantir que ambos os endereços (origem e destino) fossem encontrados antes de desenhar a rota, a função de geocodificação foi encapsulada em uma `Promise`. O `Promise.all` é usado para buscar os dois endereços simultaneamente e tratar erros de forma específica.

```javascript

document.getElementById('buscarRota').addEventListener('click', function() {

// ...

const geocoder = L.Control.Geocoder.nominatim();

// Converte a função de callback do geocoder em uma Promise

const geocodePromise = (query) => {

return new Promise((resolve, reject) => {

geocoder.geocode(query, (results) => {

if (results && results.length > 0) {

resolve(results[0].center); // Sucesso: retorna a coordenada

} else {

reject(query); // Falha: retorna o texto que falhou

}

});

});

};

// Tenta buscar os dois endereços ao mesmo tempo

Promise.all([

geocodePromise(origemInput),

geocodePromise(destinoInput)

])

.then(([latlngOrigem, latlngDestino]) => {

// Se ambos funcionarem, adiciona os pontos

addPoint(latlngOrigem, false);

addPoint(latlngDestino, true);

})

.catch((failedQuery) => {

// Se um deles falhar, dá um alerta específico

alert(`Endereço não encontrado: "${failedQuery}".`);

});

});
