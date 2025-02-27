//Datos de entrada

let conjuntoDatos = [];

//Datos calculados

let meanSet = [];
let medianSet = [];
let standardDeviation = [];
let discardedItems = [];
let remainingItems = [];
let currentDataSetIndex = 0;

meanSet = [5.2, 3.8, 7.1];
medianSet = [5.0, 3.5, 7.0];
standardDeviation = [1.2, 0.9, 1.5];
discardedItems = [[1.2, 1.5], [2.1], [3.4, 3.6, 3.8]];
remainingItems = [
  [4.8, 5.2, 5.6, 50, 51],
  [3.1, 3.5, 4.2],
  [6.8, 7.1, 7.5],
];

//Componentes html
const dataTable = document.getElementById("dataTable");
const grahpLeftButton = document.getElementById("grahpLeftButton");
const grahpRightButton = document.getElementById("grahpRightButton");

let histogramChart;

//Optener los datos
document.addEventListener("inputDataUpdated", function (e) {
  conjuntoDatos = e.detail;
  console.log(conjuntoDatos);
  updateTable();
  initializeGraph();
  updateButtonStates();
});

function updateTable() {
  dataTable.innerHTML =
    "<thead><tr><th>Iteración</th><th>Media</th><th>Mediana</th><th>Desviación Estándar</th><th>Items Descartados</th><th>Items Restantes</th></tr></thead>";

  let tbody = document.createElement("tbody");

  for (let i = 0; i < meanSet.length; i++) {
    let row = tbody.insertRow();
    row.insertCell(0).textContent = i + 1;
    row.insertCell(1).textContent = meanSet[i].toFixed(2);
    row.insertCell(2).textContent = medianSet[i].toFixed(2);
    row.insertCell(3).textContent = standardDeviation[i].toFixed(2);
    row.insertCell(4).textContent = discardedItems[i].join(", ");
    row.insertCell(5).textContent = remainingItems[i].join(", ");
  }

  dataTable.appendChild(tbody);
}

grahpLeftButton.addEventListener("click", () => {
  if (currentDataSetIndex > 0) {
    currentDataSetIndex--;
    updateGraph(currentDataSetIndex);
  }
  updateButtonStates();
});

grahpRightButton.addEventListener("click", () => {
  if (currentDataSetIndex < remainingItems.length - 1) {
    currentDataSetIndex++;
    updateGraph(currentDataSetIndex);
  }
  updateButtonStates();
});

function updateButtonStates() {
  if (currentDataSetIndex === 0) {
    grahpLeftButton.classList.add("icon-button-disable");
  } else {
    grahpLeftButton.classList.remove("icon-button-disable");
  }

  if (currentDataSetIndex === remainingItems.length - 1) {
    grahpRightButton.classList.add("icon-button-disable");
  } else {
    grahpRightButton.classList.remove("icon-button-disable");
  }
}

function initializeGraph() {
  const data = {
    labels: ["0-10", "10-20", "20-30", "30-40", "40-50"],
    datasets: [
      {
        label: `Datos de la iteración ${currentDataSetIndex + 1}`,
        data: remainingItems[currentDataSetIndex],
        backgroundColor: "#698949AA",
        borderColor: "#698949",
        borderWidth: 2,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      scales: {
        x: {
          title: { display: true, text: "Rango de valores" },
        },
        y: {
          title: { display: true, text: "Frecuencia" },
        },
      },
    },
  };

  const ctx = document.getElementById("histogramCanvas").getContext("2d");
  histogramChart = new Chart(ctx, config);
}

function updateGraph(index) {
  currentDataSetIndex = index;
  histogramChart.data.datasets[0].data = remainingItems[currentDataSetIndex];
  histogramChart.data.datasets[0].label = `Datos de la iteración ${
    currentDataSetIndex + 1
  }`;
  histogramChart.update();
}
