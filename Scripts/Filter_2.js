//Datos de entrada

let rawDataSet = [];

//Datos calculados

let meanSet = [];
let medianSet = [];
let standardDeviationSet = [];
let discardedItems = [];
let remainingItems = [];
let currentDataSetIndex = 0;
let maxDataSetIndex = 0;

//Componentes html
const dataTable = document.getElementById("dataTable");
const grahpLeftButton = document.getElementById("grahpLeftButton");
const grahpRightButton = document.getElementById("grahpRightButton");

let histogramChart;

document.addEventListener("inputDataUpdated", function (e) {
  rawDataSet = e.detail;
  calculateData();
  updateTable();
  initializeGraph();
  updateButtonStates();
});

function calculateData() {
  currentDataSet = rawDataSet;
  meanSet = [];
  medianSet = [];
  standardDeviationSet = [];

  discardedItems = [];
  remainingItems = [];

  currentDataSetIndex = 0;
  maxDataSetIndex = 0;

  let remainig = [];
  let discarded = [];
  do {
    let mean = calculateMean(currentDataSet);
    let median = calculateMedian(currentDataSet);
    let standardDeviation = calculateStandardDeviation(currentDataSet, mean);
    let zetalizedItems = calculateZScores(
      currentDataSet,
      mean,
      standardDeviation
    );

    remainig = [];
    discarded = [];

    [remainig, discarded] = filterDataByZScores(currentDataSet, zetalizedItems);

    meanSet.push(mean);
    medianSet.push(median);
    standardDeviationSet.push(standardDeviation);
    remainingItems.push(remainig);
    discardedItems.push(discarded);

    currentDataSet = remainig;
    maxDataSetIndex++;
  } while (discarded.length > 0);
}

function calculateMean(dataset) {
  let total = 0;
  for (let i = 0; i < dataset.length; i++) {
    total += dataset[i];
  }
  let mean = total / dataset.length;
  return parseFloat(mean);
}

function calculateMedian(dataset) {
  dataset = [...dataset].sort((a, b) => a - b);
  const half = Math.floor(dataset.length / 2);

  return dataset.length % 2
    ? parseFloat(dataset[half])
    : parseFloat((dataset[half - 1] + dataset[half]) / 2);
}

function calculateStandardDeviation(dataset, mean) {
  let n = dataset.length;
  let total = 0;
  if (n <= 1) return 0;

  let variance =
    dataset.reduce((total, x) => total + Math.pow(x - mean, 2), 0) / (n - 1);

  let s = Math.sqrt(total / n - 1);

  return Math.sqrt(variance);
}

function calculateZScores(dataset, mean, standardDeviation) {
  if (standardDeviation === 0) return dataset.map(() => 0);

  return dataset.map((x) =>
    parseFloat((x - mean) / standardDeviation).toFixed(2)
  );
}

function filterDataByZScores(dataset, zScores) {
  let remainingItemsAux = [...dataset];
  let discardedItemsAux = [];

  let maxAbsZIndex = -1;
  let maxAbsZValue = -Infinity;

  for (let i = 0; i < zScores.length; i++) {
    let absZ = Math.abs(zScores[i]);
    if ((zScores[i] < -3 || zScores[i] > 3) && absZ > maxAbsZValue) {
      maxAbsZValue = absZ;
      maxAbsZIndex = i;
    }
  }

  if (maxAbsZIndex !== -1) {
    discardedItemsAux.push(remainingItemsAux[maxAbsZIndex]);
    remainingItemsAux.splice(maxAbsZIndex, 1);
  }

  return [remainingItemsAux, discardedItemsAux];
}

function updateTable() {
  dataTable.innerHTML =
    "<thead><tr><th>Iteración</th><th>Media</th><th>Mediana</th><th>Desviación Estándar</th><th>Item Descartado</th><th>Cantidad de Items Restantes</th></tr></thead>";

  let tbody = document.createElement("tbody");

  for (let i = 0; i < meanSet.length; i++) {
    let row = tbody.insertRow();
    row.insertCell(0).textContent = i + 1;
    row.insertCell(1).textContent = meanSet[i].toFixed(2);
    row.insertCell(2).textContent = medianSet[i].toFixed(2);
    row.insertCell(3).textContent = standardDeviationSet[i].toFixed(2);
    row.insertCell(4).textContent = discardedItems[i].join(", ");
    row.insertCell(5).textContent = remainingItems[i].length;
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

  if (currentDataSetIndex === maxDataSetIndex - 1) {
    grahpRightButton.classList.add("icon-button-disable");
  } else {
    grahpRightButton.classList.remove("icon-button-disable");
  }
}

function calculateGroups(currentDataSet, groupAmount = 10) {
  if (currentDataSet.length === 0) return { labels: [], bins: [] };

  const min = Math.min(...currentDataSet);
  const max = Math.max(...currentDataSet);
  const interval = (max - min) / groupAmount;

  let bins = new Array(groupAmount).fill(0);
  let labels = [];

  for (let i = 0; i < groupAmount; i++) {
    let lowerBound = min + i * interval;
    let upperBound = lowerBound + interval;
    if (i === groupAmount - 1) upperBound = max;

    labels.push(`[${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}]`);
  }

  currentDataSet.forEach((value) => {
    let index = Math.min(Math.floor((value - min) / interval), groupAmount - 1);
    bins[index]++;
  });

  return { labels, bins };
}

function initializeGraph() {
  if (histogramChart) {
    histogramChart.destroy();
  }

  let { labels, bins } = calculateGroups(remainingItems[currentDataSetIndex]);
  const data = {
    labels: labels,
    datasets: [
      {
        label: `Datos de la iteración ${currentDataSetIndex + 1}`,
        data: bins,
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
  histogramChart.update();
}

function updateGraph(index) {
  currentDataSetIndex = index;

  let { labels, bins } = calculateGroups(remainingItems[currentDataSetIndex]);

  histogramChart.data.labels = labels;
  histogramChart.data.datasets[0].data = bins;
  histogramChart.data.datasets[0].label = `Datos de la iteración ${
    currentDataSetIndex + 1
  }`;

  histogramChart.update();
}
