// Datos de entrada
let rawDataSet = [];
let syntheticDataAmount = 0;
let groupAmount = 0;

// Datos calculados
let groupsSet = [];
let groupMarkSet = [];
let absoluteFrequencySet = [];
let absoluteFrequencyCumulativeSet = [];
let relativeFrequencySet = [];
let relativeFrequencyCumulativeSet = [];
let currentDataSetIndex = 0;
let maxDataSetIndex = 1;

let syntheticDataSet = [];

// Componentes html
const dataTable = document.getElementById("dataTable");
const comparativeTable = document.getElementById("comparativeTable");
const graphLeftButton = document.getElementById("grahpLeftButton");
const graphRightButton = document.getElementById("grahpRightButton");
const syntheticDataTextArea = document.getElementById("syntheticDataTextArea");
let histogramChart;

//Trigger event
document.addEventListener("tabulationInputDataUpdated", function (e) {
  const dataReceived = e.detail;

  rawDataSet = dataReceived.dataSet;
  groupAmount = dataReceived.groupAmount;
  syntheticDataAmount = dataReceived.dataAmount;

  calculateData();
  updateTable();
  updateComparativeTable();
  initializeGraph();
  updateButtonStates();
});

function calculateData() {
  currentDataSetIndex = 0;

  groupsSet = calculateGroups();
  groupMarkSet = calculateGroupMark();
  absoluteFrequencySet = calculateAbsoluteFrequency();
  absoluteFrequencyCumulativeSet = calculateCumulativeAbsoluteFrequency();
  relativeFrequencySet = calculateRelativeFrequency();
  relativeFrequencyCumulativeSet = calculateCumulativeRelativeFrequency();
  syntheticDataSet = generateSyntheticData();

  syntheticDataTextArea.value = `Cantidad de datos generados: ${syntheticDataSet.length} \n [${syntheticDataSet}]`;
}

//Tabulation Data Calculations
function calculateGroups() {
  const min = Math.min(...rawDataSet);
  const max = Math.max(...rawDataSet);
  const interval = (max - min) / groupAmount;

  let groups = [];
  for (let i = 0; i < groupAmount; i++) {
    let lowerBound = min + i * interval;
    let upperBound = lowerBound + interval;
    if (i === groupAmount - 1) upperBound = max;
    groups.push([lowerBound, upperBound]);
  }
  return groups;
}

function calculateGroupMark() {
  return groupsSet.map(([lower, upper]) => (lower + upper) / 2);
}

function calculateAbsoluteFrequency() {
  let frequencies = new Array(groupAmount).fill(0);

  rawDataSet.forEach((value) => {
    for (let i = 0; i < groupsSet.length; i++) {
      if (
        value >= groupsSet[i][0] &&
        (i === groupsSet.length - 1
          ? value <= groupsSet[i][1]
          : value < groupsSet[i][1])
      ) {
        frequencies[i]++;
        break;
      }
    }
  });
  return frequencies;
}

function calculateCumulativeAbsoluteFrequency() {
  let cumulative = [];
  absoluteFrequencySet.reduce((sum, freq, i) => {
    cumulative[i] = sum + freq;
    return cumulative[i];
  }, 0);
  return cumulative;
}

function calculateRelativeFrequency() {
  const total = rawDataSet.length;
  return absoluteFrequencySet.map((freq) => freq / total);
}

function calculateCumulativeRelativeFrequency() {
  let cumulative = [];
  relativeFrequencySet.reduce((sum, freq, i) => {
    cumulative[i] = sum + freq;
    return cumulative[i];
  }, 0);
  return cumulative;
}

//Synthetic Data Calculations
function generateSyntheticData() {
  let syntheticData = [];
  let dataAmountPerGroup = [];
  let dataAux = [];

  for (let i = 0; i < groupAmount; i++) {
    dataAmountPerGroup.push(
      Math.floor(relativeFrequencySet[i] * syntheticDataAmount)
    );
  }

  for (let i = 0; i < groupAmount; i++) {
    let a = groupsSet[i][0];
    let b = groupsSet[i][1];
    dataAux = Array.from({ length: dataAmountPerGroup[i] }, () =>
      parseFloat((a + (b - a) * Math.random()).toFixed(2))
    );
    syntheticData.push(...dataAux);
  }

  return syntheticData;
}

//Raw Data Calculations
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

function calculatePercentile(dataset, percentile) {
  if (dataset.length === 0) return null;
  if (percentile < 0 || percentile > 100)
    throw new Error("El percentil debe estar entre 0 y 100.");

  dataset = [...dataset].sort((a, b) => a - b);

  let index = (percentile / 100) * (dataset.length - 1);

  if (Number.isInteger(index)) {
    return dataset[index];
  } else {
    let lower = Math.floor(index);
    let upper = Math.ceil(index);
    return dataset[lower] + (index - lower) * (dataset[upper] - dataset[lower]);
  }
}

//Tabulated Data Calculations

function calculateMeanFromTable() {
  let total = 0;
  let totalFrequency = 0;

  for (let i = 0; i < groupAmount; i++) {
    total += groupMarkSet[i] * absoluteFrequencySet[i]; // Σ(xi * fi)
    totalFrequency += absoluteFrequencySet[i]; // Σfi
  }

  return total / totalFrequency;
}

function calculateMedianFromTable() {
  let totalFrequency = absoluteFrequencyCumulativeSet[groupAmount - 1]; // Total de datos
  let medianClassIndex = absoluteFrequencyCumulativeSet.findIndex(
    (f) => f >= totalFrequency / 2
  ); // Encuentra la clase donde cae la mediana

  if (medianClassIndex === -1) return null;

  let L = groupsSet[medianClassIndex][0]; // Límite inferior de la clase mediana
  let F =
    medianClassIndex > 0
      ? absoluteFrequencyCumulativeSet[medianClassIndex - 1]
      : 0; // Frecuencia acumulada anterior
  let f = absoluteFrequencySet[medianClassIndex]; // Frecuencia de la clase mediana
  let h = groupsSet[medianClassIndex][1] - groupsSet[medianClassIndex][0]; // Amplitud de clase

  return L + ((totalFrequency / 2 - F) / f) * h;
}

function calculateVarianceFromTable() {
  let mean = calculateMeanFromTable();
  let total = 0;
  let totalFrequency = 0;

  for (let i = 0; i < groupAmount; i++) {
    total += absoluteFrequencySet[i] * Math.pow(groupMarkSet[i] - mean, 2); // Σfi * (xi - μ)²
    totalFrequency += absoluteFrequencySet[i];
  }

  return total / totalFrequency; // Varianza poblacional
}

function calculateStandardDeviationFromTable() {
  return Math.sqrt(calculateVarianceFromTable());
}

function calculatePercentileFromTable(percentile) {
  let totalFrequency = absoluteFrequencyCumulativeSet[groupAmount - 1]; // Total de datos
  let percentilePosition = (percentile / 100) * totalFrequency; // Posición en la distribución

  let classIndex = absoluteFrequencyCumulativeSet.findIndex(
    (f) => f >= percentilePosition
  ); // Encuentra la clase del percentil

  if (classIndex === -1) return null;

  let L = groupsSet[classIndex][0]; // Límite inferior de la clase percentil
  let F = classIndex > 0 ? absoluteFrequencyCumulativeSet[classIndex - 1] : 0; // Frecuencia acumulada anterior
  let f = absoluteFrequencySet[classIndex]; // Frecuencia de la clase
  let h = groupsSet[classIndex][1] - groupsSet[classIndex][0]; // Amplitud de clase

  return L + ((percentilePosition - F) / f) * h;
}

//HTML Elements Manipulation
function updateTable() {
  dataTable.innerHTML =
    "<thead><tr><th>Clases</th><th>Marca de clase</th><th>Frecuencia absoluta</th><th>Frecuencia absoluta acumulada</th><th>Frecuencia relativa</th><th>Frecuencia relativa acumulada</th></tr></thead>";

  let tbody = document.createElement("tbody");

  for (let i = 0; i < groupAmount; i++) {
    let row = tbody.insertRow();
    row.insertCell(0).textContent = `[${groupsSet[i][0].toFixed(
      2
    )}, ${groupsSet[i][1].toFixed(2)})`;
    row.insertCell(1).textContent = groupMarkSet[i].toFixed(2);
    row.insertCell(2).textContent = absoluteFrequencySet[i];
    row.insertCell(3).textContent = absoluteFrequencyCumulativeSet[i];
    row.insertCell(4).textContent = relativeFrequencySet[i].toFixed(4);
    row.insertCell(5).textContent =
      relativeFrequencyCumulativeSet[i].toFixed(4);
  }
  dataTable.appendChild(tbody);
}

function updateComparativeTable() {
  comparativeTable.innerHTML =
    "<thead><tr><th>Datos</th><th>Media</th><th>Mediana</th><th>Varianza</th><th>Desviación estándar</th><th>Percentil 10</th><th>Percentil 25</th><th>Percentil 32</th><th>Percentil 75</th><th>Percentil 90</th></tr></thead>";

  let tbody = document.createElement("tbody");

  let rawMean = calculateMean(rawDataSet);
  let syntheticMean = calculateMean(syntheticDataSet);
  let rawStdDev = calculateStandardDeviation(rawDataSet, rawMean);
  let syntheticStdDev = calculateStandardDeviation(
    syntheticDataSet,
    syntheticMean
  );

  let means = [rawMean, calculateMeanFromTable(), syntheticMean];
  let medians = [
    calculateMedian(rawDataSet),
    calculateMedianFromTable(),
    calculateMedian(syntheticDataSet),
  ];
  let variances = [
    rawStdDev ** 2,
    calculateVarianceFromTable(),
    syntheticStdDev ** 2,
  ];
  let standardDeviations = [
    rawStdDev,
    calculateStandardDeviationFromTable(),
    syntheticStdDev,
  ];

  let percentiles = [10, 25, 32, 75, 90].map((p) => [
    calculatePercentile(rawDataSet, p),
    calculatePercentileFromTable(p),
    calculatePercentile(syntheticDataSet, p),
  ]);

  let content = [means, medians, variances, standardDeviations, ...percentiles];

  let labels = ["Datos crudos", "Datos tabulados", "Datos sintéticos"];

  for (let i = 0; i < 3; i++) {
    let row = tbody.insertRow();
    row.insertCell(0).innerHTML = `<strong>${labels[i]}</strong>`;
    for (let j = 0; j < content.length; j++) {
      row.insertCell(j + 1).textContent = parseFloat(content[j][i]).toFixed(4);
    }
  }

  comparativeTable.appendChild(tbody);
}

graphLeftButton.addEventListener("click", () => {
  if (currentDataSetIndex > 0) {
    currentDataSetIndex--;
    updateGraph(currentDataSetIndex);
  }
  updateButtonStates();
});

graphRightButton.addEventListener("click", () => {
  if (currentDataSetIndex < maxDataSetIndex) {
    currentDataSetIndex++;
    updateGraph(currentDataSetIndex);
  }
  updateButtonStates();
});

function updateButtonStates() {
  if (currentDataSetIndex === 0) {
    graphLeftButton.classList.add("icon-button-disable");
  } else {
    graphLeftButton.classList.remove("icon-button-disable");
  }

  if (currentDataSetIndex === maxDataSetIndex) {
    graphRightButton.classList.add("icon-button-disable");
  } else {
    graphRightButton.classList.remove("icon-button-disable");
  }
}

function initializeGraph() {
  if (histogramChart) {
    histogramChart.destroy();
  }

  let { labels, bins } = calculateGraphGroups(rawDataSet, groupAmount);
  const data = {
    labels: labels,
    datasets: [
      {
        label:
          currentDataSetIndex === 0 ? "Datos originales" : "Datos sintéticos",
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
}

function updateGraph(index) {
  currentDataSetIndex = index;

  let { labels, bins } =
    currentDataSetIndex === 0
      ? calculateGraphGroups(rawDataSet, groupAmount)
      : calculateGraphGroups(syntheticDataSet, groupAmount);
  histogramChart.data.labels = labels;
  histogramChart.data.datasets[0].data = bins;
  histogramChart.data.datasets[0].label =
    currentDataSetIndex === 0 ? "Datos originales" : "Datos sintéticos";
  histogramChart.data.datasets[0].backgroundColor =
    currentDataSetIndex === 0 ? "#698949AA" : "#B5EAECAA";
  histogramChart.data.datasets[0].borderColor =
    currentDataSetIndex === 0 ? "#698949" : "#B5EAEC";

  histogramChart.update();
}

function calculateGraphGroups(currentDataSet, groupAmount) {
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
