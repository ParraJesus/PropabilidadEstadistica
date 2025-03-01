// Datos de entrada
let rawDataSet = [];
let groupAmount = 0;

// Datos calculados
let groupsSet = [];
let groupMarkSet = [];
let absoluteFrequencySet = [];
let absoluteFrequencyCumulativeSet = [];
let relativeFrequencySet = [];
let relativeFrequencyCumulativeSet = [];

// Componentes html
const dataTable = document.getElementById("dataTable");
let histogramChart;

document.addEventListener("tabulationInputDataUpdated", function (e) {
  const dataReceived = e.detail;

  rawDataSet = dataReceived.dataSet;
  groupAmount = dataReceived.groupAmount;
  calculateData();
  updateTable();
  initializeGraph();
});

function calculateData() {
  groupsSet = calculateGroups();
  groupMarkSet = calculateGroupMark();
  absoluteFrequencySet = calculateAbsoluteFrequency();
  absoluteFrequencyCumulativeSet = calculateCumulativeAbsoluteFrequency();
  relativeFrequencySet = calculateRelativeFrequency();
  relativeFrequencyCumulativeSet = calculateCumulativeRelativeFrequency();
}

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

function initializeGraph() {
  if (histogramChart) {
    histogramChart.destroy();
  }

  let { labels, bins } = calculateGraphGroups(rawDataSet, groupAmount);

  const data = {
    labels: labels,
    datasets: [
      {
        label: `Datos`,
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
