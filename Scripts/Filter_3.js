//Datos de entrada

let rawDataSet = [];

//Datos calculados

let meanSet = [];

let upperWhiskerSet = [];
let quartile25Set = [];
let quartile50Set = [];
let quartile75Set = [];
let lowerWhiskerSet = [];

let discardedItemsSet = [];
let remainingItemsSet = [];

let currentDataSetIndex = 0;
let maxDataSetIndex = 0;

//Componentes html
const dataTable = document.getElementById("boxplotTable");
const boxplotLeftButton = document.getElementById("boxplotLeftButton");
const boxplotRightButton = document.getElementById("boxplotRightButton");

let boxplot;

/*
  1- encontrar la media
  2- encontrar los percentiles 25, 50, 75
  3- encontrar el IQR ()
  4- encontrar outliners
  5- remover outliners
  7- revisar si quedan más
*/

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
  upperWhiskerSet = [];
  quartile25Set = [];
  quartile50Set = [];
  quartile75Set = [];
  lowerWhiskerSet = [];
  discardedItemsSet = [];
  remainingItemsSet = [];

  currentDataSetIndex = 0;
  maxDataSetIndex = 0;

  let remaining = [];
  let discarded = [];
  do {
    let mean = calculateMean(currentDataSet);
    let quartile25 = calculateQuartile(currentDataSet, 1);
    let quartile50 = calculateQuartile(currentDataSet, 2);
    let quartile75 = calculateQuartile(currentDataSet, 3);

    let [maxW, minW] = calculateWhiskers(
      currentDataSet,
      quartile25,
      quartile75
    );

    [remaining, discarded] = findOutliners(currentDataSet, maxW, minW);

    meanSet.push(mean);
    quartile25Set.push(quartile25);
    quartile50Set.push(quartile50);
    quartile75Set.push(quartile75);
    lowerWhiskerSet.push(minW);
    upperWhiskerSet.push(maxW);
    remainingItemsSet.push(remaining);
    discardedItemsSet.push(discarded);

    currentDataSet = remaining;
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

function calculateQuartile(dataset, quartile) {
  if (![1, 2, 3].includes(quartile)) {
    return NaN;
  }

  const sortedData = [...dataset].sort((a, b) => a - b);

  const position = (quartile / 4) * (sortedData.length + 1);
  const index = Math.floor(position) - 1;
  const fraction = position - Math.floor(position);

  if (index >= 0 && index < sortedData.length - 1) {
    return (
      sortedData[index] + fraction * (sortedData[index + 1] - sortedData[index])
    );
  }

  return sortedData[Math.max(0, Math.min(index, sortedData.length - 1))];
}

function calculateWhiskers(dataset, quartile25, quartile75) {
  let iqr = quartile75 - quartile25;

  let maxWhisker = quartile75 + iqr * 1.5;
  let minWhisker = quartile25 - iqr * 1.5;

  let maxValue = Math.max(...dataset);
  let minValue = Math.min(...dataset);

  if (maxValue < maxWhisker) maxWhisker = maxValue;
  if (minValue > minWhisker) minWhisker = minValue;

  return [maxWhisker, minWhisker];
}

function findOutliners(dataset, upperWhisker, lowerWhisker) {
  let remainingItemsAux = [];
  let discardedItemsAux = [];

  dataset.forEach((value) => {
    if (value >= lowerWhisker && value <= upperWhisker) {
      remainingItemsAux.push(value);
    } else {
      discardedItemsAux.push(value);
    }
  });
  return [remainingItemsAux, discardedItemsAux];
}

function updateTable() {
  dataTable.innerHTML =
    "<thead><tr><th>Iteración</th><th>Media</th><th>Mediana</th><th>Extremo Inferior</th><th>Extremo Superior</th><th>Items Removidos (Outliners)</th><th>Items Restantes (cantidad)</th></tr></thead>";

  let tbody = document.createElement("tbody");

  for (let i = 0; i < maxDataSetIndex; i++) {
    let row = tbody.insertRow();
    row.insertCell(0).textContent = i + 1;
    row.insertCell(1).textContent = meanSet[i].toFixed(2);
    row.insertCell(2).textContent = quartile50Set[i].toFixed(2);
    row.insertCell(3).textContent = lowerWhiskerSet[i].toFixed(2);
    row.insertCell(4).textContent = upperWhiskerSet[i].toFixed(2);
    row.insertCell(5).textContent = discardedItemsSet[i].join(", ");
    row.insertCell(6).textContent = remainingItemsSet[i].length;
  }
  dataTable.appendChild(tbody);
}

boxplotLeftButton.addEventListener("click", () => {
  if (currentDataSetIndex > 0) {
    currentDataSetIndex--;
    updateGraph(currentDataSetIndex);
  }
  updateButtonStates();
});

boxplotRightButton.addEventListener("click", () => {
  if (currentDataSetIndex < remainingItemsSet.length - 1) {
    currentDataSetIndex++;
    updateGraph(currentDataSetIndex);
  }
  updateButtonStates();
});

function updateButtonStates() {
  if (currentDataSetIndex === 0) {
    boxplotLeftButton.classList.add("icon-button-disable");
  } else {
    boxplotLeftButton.classList.remove("icon-button-disable");
  }

  if (currentDataSetIndex === maxDataSetIndex - 1) {
    boxplotRightButton.classList.add("icon-button-disable");
  } else {
    boxplotRightButton.classList.remove("icon-button-disable");
  }
}

function initializeGraph() {
  if (boxplot) {
    boxplot.destroy();
  }

  const data = {
    labels: [""],
    datasets: [
      {
        label: `Iteración ${currentDataSetIndex + 1}`,
        backgroundColor: "#DB7FEAAA",
        borderColor: "#DB7FEA",
        borderWidth: 1,
        outlierRadius: 3,
        outlierBackgroundColor: "#E95D5D",
        data: [
          {
            min: lowerWhiskerSet[currentDataSetIndex],
            q1: quartile25Set[currentDataSetIndex],
            median: quartile50Set[currentDataSetIndex],
            q3: quartile75Set[currentDataSetIndex],
            max: upperWhiskerSet[currentDataSetIndex],
            mean: meanSet[currentDataSetIndex],
            outliers: discardedItemsSet[currentDataSetIndex],
          },
        ],
      },
    ],
  };

  const config = {
    type: "boxplot",
    data: data,
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              let dataset = context.dataset.data[context.dataIndex];

              if (!dataset) return "";

              let tooltipText = [
                `Iteración: ${currentDataSetIndex + 1}`,
                `Min: ${dataset.min.toFixed(4)}`,
                `Q1: ${dataset.q1.toFixed(4)}`,
                `Mediana: ${dataset.median.toFixed(4)}`,
                `Q3: ${dataset.q3.toFixed(4)}`,
                `Max: ${dataset.max.toFixed(4)}`,
                `Media: ${dataset.mean.toFixed(4)}`,
              ];
              if (dataset.outliers && dataset.outliers.length > 0) {
                tooltipText.push(`Outliers: ${dataset.outliers.join(", ")}`);
              }

              return tooltipText;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Valores" },
          beginAtZero: true,
          suggestedMin: Math.min(
            lowerWhiskerSet[currentDataSetIndex],
            ...discardedItemsSet[currentDataSetIndex]
          ),
          suggestedMax: Math.max(
            upperWhiskerSet[currentDataSetIndex],
            ...discardedItemsSet[currentDataSetIndex]
          ),
        },
      },
    },
  };

  const ctx = document.getElementById("boxplot").getContext("2d");
  boxplot = new Chart(ctx, config);
}

function updateGraph(index) {
  currentDataSetIndex = index;

  boxplot.data.datasets[0].data = [
    {
      min: lowerWhiskerSet[index],
      q1: quartile25Set[index],
      median: quartile50Set[index],
      q3: quartile75Set[index],
      max: upperWhiskerSet[index],
      mean: meanSet[index],
      outliers: discardedItemsSet[index],
    },
  ];
  boxplot.data.datasets[0].label = `Iteración ${currentDataSetIndex + 1}`;

  boxplot.options.scales.x.suggestedMin = Math.min(
    lowerWhiskerSet[index],
    ...discardedItemsSet[index]
  );
  boxplot.options.scales.x.suggestedMax = Math.max(
    upperWhiskerSet[index],
    ...discardedItemsSet[index]
  );

  boxplot.update();
}
