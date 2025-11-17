// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Header background change on scroll
window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  if (window.scrollY > 100) {
    header.style.background = "rgba(9, 9, 11, 0.98)";
  } else {
    header.style.background = "rgba(9, 9, 11, 0.95)";
  }
});

// Map functionality
const mapCanvas = document.getElementById("mapCanvas");
const routeDistance = document.getElementById("routeDistance");
const routeTime = document.getElementById("routeTime");
const routeCost = document.getElementById("routeCost");
const suitableDrone = document.getElementById("suitableDrone");
const droneSelect = document.getElementById("droneSelect");
const packageWeight = document.getElementById("packageWeight");

// --- Início da Lógica do Leaflet ---

// 1. Inicializa o mapa
const map = L.map("mapCanvas").setView([-22.513, -45.646], 13);

// 2. Adiciona o "fundo" do mapa (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// 3. Variáveis para guardar os dados da rota
let routeCoords = [];
let routeMarkers = [];
let polyline = null;

const droneSpecs = {
  compacto: {
    maxWeight: 2,
    speed: 45,
    costPerKm: 4.0,
    name: "Compacto",
    maxRange: 15,
    maxAutonomy: 30,
  },
  medio: {
    maxWeight: 5,
    speed: 55,
    costPerKm: 5.5,
    name: "Médio",
    maxRange: 25,
    maxAutonomy: 45,
  },
  carga: {
    maxWeight: 15,
    speed: 65,
    costPerKm: 8.0,
    name: "Carga",
    maxRange: 50,
    maxAutonomy: 60,
  },
};

// Função chamada ao clicar no mapa
function onMapClick(e) {
  if (routeCoords.length >= 2) {
    clearRoute();
    addPoint(e.latlng);
  } else {
    addPoint(e.latlng);
  }
}

function addPoint(latlng, update = true) {
  const marker = L.marker(latlng, { draggable: true }).addTo(map);

  marker._myIndex = routeMarkers.length;

  marker.on("dragend", function (e) {
    const newLatLng = e.target.getLatLng();
    routeCoords[e.target._myIndex] = newLatLng;

    updatePolyline();
    updateRouteInfo();
  });

  routeMarkers.push(marker);
  routeCoords.push(latlng);

  if (update) {
    updatePolyline();
    updateRouteInfo();
  }
}

function updatePolyline() {
  if (polyline) {
    map.removeLayer(polyline);
  }
  polyline = L.polyline(routeCoords, { color: "var(--amber-500)" }).addTo(map);
  if (routeCoords.length > 0) {
    map.fitBounds(polyline.getBounds().pad(0.1));
  }
}

function calculateDistance() {
  let totalDistance = 0;
  for (let i = 1; i < routeCoords.length; i++) {
    totalDistance += routeCoords[i - 1].distanceTo(routeCoords[i]);
  }
  return (totalDistance / 1000).toFixed(1);
}

function updateRouteInfo() {
  if (routeCoords.length < 2) {
    routeDistance.textContent = "0 km";
    routeTime.textContent = "0 min";
    routeCost.textContent = "R$ 0,00";
    suitableDrone.textContent = "-";
    return;
  }

  const distance = parseFloat(calculateDistance());
  const selectedDrone = droneSelect.value;
  const weight = parseFloat(packageWeight.value);
  const drone = droneSpecs[selectedDrone];

  const time = Math.ceil((distance / drone.speed) * 60);
  const cost = distance * drone.costPerKm;

  routeDistance.textContent = distance + " km";
  routeTime.textContent = time + " min";
  routeCost.textContent = "R$ " + cost.toFixed(2);

  let suitable = true;
  let errorMsg = "";

  if (weight > drone.maxWeight) {
    suitable = false;
    let recommended = null;
    for (const [key, spec] of Object.entries(droneSpecs)) {
      if (weight <= spec.maxWeight) {
        recommended = spec;
        break;
      }
    }
    if (recommended) {
      errorMsg = recommended.name + " (recomendado)";
    } else {
      errorMsg = "Peso excede capacidade";
    }
  } else if (distance > drone.maxRange) {
    suitable = false;
    errorMsg = "Distância excede alcance";
  } else if (time > drone.maxAutonomy) {
    suitable = false;
    errorMsg = "Excede autonomia de voo";
  }

  if (suitable) {
    suitableDrone.textContent = drone.name + " ✓";
    suitableDrone.style.color = "var(--amber-400)";
  } else {
    suitableDrone.textContent = errorMsg;
    suitableDrone.style.color = "#ef4444";
  }
}

function clearRoute() {
  routeMarkers.forEach((marker) => map.removeLayer(marker));
  routeMarkers = [];
  routeCoords = [];

  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }

  updateRouteInfo();
}

// --- Fim da Lógica do Leaflet ---

// Evento de clique no mapa (mantido)
map.on("click", onMapClick);

// --- NOVO: 'Buscar Rota' ATUALIZADO para mais robustez ---
document.getElementById("buscarRota").addEventListener("click", function () {
  const origemInput = document.getElementById("origem").value;
  const destinoInput = document.getElementById("destino").value;

  if (!origemInput || !destinoInput) {
    alert("Por favor, preencha os endereços de origem e destino.");
    return;
  }

  clearRoute();

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
  Promise.all([geocodePromise(origemInput), geocodePromise(destinoInput)])
    .then(([latlngOrigem, latlngDestino]) => {
      // Se ambos funcionarem, adiciona os pontos
      addPoint(latlngOrigem, false); // Adiciona ponto 1
      addPoint(latlngDestino, true); // Adiciona ponto 2 e desenha a linha
    })
    .catch((failedQuery) => {
      // Se um deles falhar, dá um alerta específico
      alert(
        `Endereço não encontrado: "${failedQuery}".\n\nPor favor, tente ser mais específico (ex: "Nome da Rua, Cidade, País").`
      );
    });
});

// Eventos dos botões e inputs
document.getElementById("clearRoute").addEventListener("click", clearRoute);
document.getElementById("optimizeRoute").addEventListener("click", function () {
  if (routeCoords.length < 2) return;

  const originalDistance = parseFloat(calculateDistance());
  const reversedCoords = [...routeCoords].reverse();

  let reversedDistance = 0;
  for (let i = 1; i < reversedCoords.length; i++) {
    reversedDistance += reversedCoords[i - 1].distanceTo(reversedCoords[i]);
  }
  reversedDistance = reversedDistance / 1000;

  if (reversedDistance < originalDistance) {
    const coordsToUse = [...reversedCoords];
    clearRoute();

    coordsToUse.forEach((latlng) => addPoint(latlng, false));

    updatePolyline();
    updateRouteInfo();
  }
});

droneSelect.addEventListener("change", updateRouteInfo);
packageWeight.addEventListener("input", updateRouteInfo);

// Animação de Fade in
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = "0.2s";
      entry.target.classList.add("fade-in");
    }
  });
}, observerOptions);

document
  .querySelectorAll(".service-card, .drone-card, .stat-item, .process-step")
  .forEach((el) => {
    observer.observe(el);
  });

/* ===========================================================
 ⬇️ NOVO JAVASCRIPT PARA AS NOVAS SEÇÕES ⬇️
===========================================================
*/

// --- Lógica para as Abas (TABS) "Casos de Uso" ---
const tabButtonsContainer = document.querySelector(".tab-buttons");
const tabPanes = document.querySelectorAll(".tab-pane");
const tabButtons = document.querySelectorAll(".tab-buttons button");

tabButtonsContainer.addEventListener("click", (e) => {
  const clickedButton = e.target.closest("button");

  if (!clickedButton) return; // Sai se o clique não foi em um botão

  // Pega o ID do painel alvo (ex: "tab-restaurantes")
  const tabId = clickedButton.dataset.tab;
  const targetPane = document.getElementById(tabId);

  // 1. Desativa todos os botões e painéis
  tabButtons.forEach((button) => {
    button.classList.remove("btn-primary");
    button.classList.add("btn-secondary");
  });
  tabPanes.forEach((pane) => {
    pane.classList.remove("active");
  });

  // 2. Ativa o botão clicado e o painel correspondente
  clickedButton.classList.remove("btn-secondary");
  clickedButton.classList.add("btn-primary");
  targetPane.classList.add("active");
});

// --- Lógica para "Calculadora de Drones" ---
const dronePesoInput = document.getElementById("drone-peso");
const droneDistanciaInput = document.getElementById("drone-distancia");
const droneGrid = document.getElementById("drone-grid");
const droneCards = droneGrid.querySelectorAll(".drone-card");
const droneFeedback = document.getElementById("drone-feedback");

function updateDroneRecommendation() {
  const peso = parseFloat(dronePesoInput.value) || 0;
  const distancia = parseFloat(droneDistanciaInput.value) || 0;

  // Se os campos estiverem vazios, reseta tudo
  if (peso === 0 || distancia === 0) {
    droneCards.forEach((card) => card.classList.remove("faded"));
    droneFeedback.textContent = "Preencha os campos para ver a recomendação.";
    return;
  }

  let recommendedDrone = null;

  // Lógica para encontrar o drone adequado
  if (peso <= 2 && distancia <= 15) {
    recommendedDrone = "compacto";
  } else if (peso <= 5 && distancia <= 25) {
    recommendedDrone = "medio";
  } else if (peso <= 15 && distancia <= 50) {
    recommendedDrone = "carga";
  }

  // Se nenhum drone for adequado (ex: 20kg)
  if (!recommendedDrone) {
    droneCards.forEach((card) => card.classList.add("faded"));
    droneFeedback.textContent =
      "Peso ou distância excede nossa capacidade máxima.";
  } else {
    droneFeedback.textContent = `Recomendamos o Drone ${
      recommendedDrone.charAt(0).toUpperCase() + recommendedDrone.slice(1)
    }!`;

    // Aplica o filtro visual
    droneCards.forEach((card) => {
      if (card.dataset.drone === recommendedDrone) {
        card.classList.remove("faded");
      } else {
        card.classList.add("faded");
      }
    });
  }
}

// Adiciona os "ouvintes" de evento
dronePesoInput.addEventListener("input", updateDroneRecommendation);
droneDistanciaInput.addEventListener("input", updateDroneRecommendation);

/* ===========================================================
 ⬇️ NOVO: LÓGICA DO MODAL E ANIMAÇÃO DE ROTA ⬇️
=========================================================== */

// Elementos do Modal
const demoModal = document.getElementById("demo-modal");
const openModalButton = document.getElementById("demo-button");
const closeModalButton = document.getElementById("close-modal");
const demoStatus = document.getElementById("demo-status");

let demoMap = null; // Variável para guardar o mapa
let droneMarker = null;
let animationInterval = null;

// Função para iniciar a animação
function startDemoAnimation() {
  // 1. Coordenadas (Simuladas)
  const startPoint = L.latLng(-22.473207477568856, -45.61910215038111); // Ponto de Partida
  const endPoint = L.latLng(-22.474071229339586, -45.608550278948556); // Ponto de Chegada

  // 2. Reseta o mapa se já existir
  if (demoMap) {
    demoMap.remove();
  }

  // 3. Cria o mapa dentro do modal
  demoMap = L.map("demo-map-canvas").setView(startPoint, 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    demoMap
  );

  // 4. Adiciona marcadores e linha
  L.marker(startPoint).addTo(demoMap).bindPopup("Centro de Distribuição");
  L.marker(endPoint).addTo(demoMap).bindPopup("Seu Endereço");
  const polyline = L.polyline([startPoint, endPoint], {
    color: "var(--amber-500)",
  }).addTo(demoMap);

  // 5. Cria o marcador do drone (AGORA COM ÍCONE)
  const droneIcon = L.icon({
    // Ícone SVG embutido (Data URI)
    iconUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24'%3E%3Cpath fill='%2360a5fa' d='M12 2a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4M6 8a4 4 0 0 0-4 4a4 4 0 0 0 4 4h2v-8H6m12 0v8h2a4 4 0 0 0 4-4a4 4 0 0 0-4-4h-2m-4 2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4Z'/%3E%3C/svg%3E",
    iconSize: [36, 36], // Tamanho do ícone
    iconAnchor: [18, 18], // Ponto de "ancora" do ícone (metade do tamanho)
    popupAnchor: [0, -18], // Onde o popup deve aparecer em relação à ancora
  });

  droneMarker = L.marker(startPoint, {
    icon: droneIcon, // Aplica o ícone personalizado
  }).addTo(demoMap);

  // 6. Lógica de Animação
  let progress = 0;
  if (animationInterval) clearInterval(animationInterval); // Limpa animação anterior

  demoStatus.textContent = "Status: Drone a caminho...";

  animationInterval = setInterval(() => {
    progress += 0.01; // Velocidade da animação

    if (progress > 1) {
      progress = 1;
      clearInterval(animationInterval);
      demoStatus.textContent = "Status: Entrega Concluída!";
    }

    // Calcula o próximo ponto na linha (Interpolação Linear)
    const newLatLng = L.latLng(
      startPoint.lat + (endPoint.lat - startPoint.lat) * progress,
      startPoint.lng + (endPoint.lng - startPoint.lng) * progress
    );

    droneMarker.setLatLng(newLatLng);
    demoMap.panTo(newLatLng); // Centraliza o mapa no drone
  }, 50); // Atualiza a cada 50ms
}

// Evento para ABRIR o modal
openModalButton.addEventListener("click", () => {
  demoModal.classList.add("active");

  // IMPORTANTE: O mapa precisa ser inicializado *depois* que o modal está visível.
  // Usamos um pequeno delay para garantir que o CSS foi aplicado.
  setTimeout(() => {
    startDemoAnimation();
  }, 100); // 100ms de delay
});

// Evento para FECHAR o modal
closeModalButton.addEventListener("click", () => {
  demoModal.classList.remove("active");
  clearInterval(animationInterval); // Para a animação
});

/* ===========================================================
 ⬇️ NOVO: LÓGICA DO WHATSAPP ⬇️
=========================================================== */

// --- NOVO: Lógica do Formulário de Contato para WhatsApp ---

// Seleciona o formulário
const contactForm = document.getElementById("contactForm");

// Adiciona um "ouvinte" ao evento de 'submit' (envio)
contactForm.addEventListener("submit", function (e) {
  // 1. Previne o envio padrão do formulário (que iria para o Formspree)
  e.preventDefault();

  // 2. Defina seu número de telefone (com código do país, sem '+' ou '00')
  const phoneNumber = "5535910140611"; // <-- Coloque seu número aqui

  // 3. Pega os dados dos campos do formulário
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const company = document.getElementById("company").value;
  const phone = document.getElementById("phone").value;
  const service = document.getElementById("service").value;
  const message = document.getElementById("message").value;

  // 4. Monta a mensagem bem elaborada
  let whatsappMessage = `*Novo Contato - SkyDrop.LTDA* 🚀\n\n`;
  whatsappMessage += `Olá! Gostaria de um orçamento.\n\n`;
  whatsappMessage += `*Nome:* ${name}\n`;
  whatsappMessage += `*Email:* ${email}\n`;

  if (company) {
    whatsappMessage += `*Empresa:* ${company}\n`;
  }
  if (phone) {
    whatsappMessage += `*Telefone:* ${phone}\n`;
  }

  whatsappMessage += `*Serviço de Interesse:* ${service}\n\n`;
  whatsappMessage += `*Mensagem:*\n${message}\n`;

  // 5. Codifica a mensagem para uma URL
  const encodedMessage = encodeURIComponent(whatsappMessage);

  // 6. Cria o link final do WhatsApp
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // 7. Abre o link em uma nova aba
  window.open(whatsappURL, "_blank");
});
