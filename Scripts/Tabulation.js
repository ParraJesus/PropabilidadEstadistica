/*
//Datos de entrada

let rawDataSet = [];
let groupAmount = 0;

//Datos calculados

let groupsSet = [];
let groupMarkSet = [];
let absoluteFrequencySet = [];
let absoluteFrequencyCumulativeSet = [];
let relativeFrequencySet = [];
let relativeFrequencyCumulativeSet = [];

//Componentes html
const dataTable = document.getElementById("dataTable");

document.addEventListener("tabulationInputDataUpdated", function (e) {
  const dataReceived = e.detail;
  rawDataSet = dataReceived.dataSet;
  groupAmount = dataReceived.groupAmount;

  console.log("recibido: ", rawDataSet);

  calculateData();
  updateTable();
});

function calculateData() {
  groupsSet = calculateGroups();
  groupMarkSet = calculateGroupMark();
  absoluteFrequencySet = calculateAbsoluteFrequency();
  absoluteFrequencyCumulativeSet = calculateCumulativeAbsoluteFrequency();
  relativeFrequencySet = calculateRelativeFrequency();
  relativeFrequencyCumulativeSet = calculateCumulativeRelativeFrequency();

  console.log(groupsSet);
}

function calculateGroups() {
  const min = Math.min(...rawDataSet);
  const max = Math.max(...rawDataSet);
  const interval = (max - min) / groupAmount;

  let groups = [];
  for (let i = 0; i < groupAmount; i++) {
    let lowerBound = min + i * interval;
    let upperBound = lowerBound + interval;
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
      if (value >= groupsSet[i][0] && value < groupsSet[i][1]) {
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
    row.insertCell(4).textContent = relativeFrequencySet[i].toFixed(2);
    row.insertCell(5).textContent =
      relativeFrequencyCumulativeSet[i].toFixed(4);
  }
  dataTable.appendChild(tbody);
}

*/

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

document.addEventListener("tabulationInputDataUpdated", function (e) {
  const dataReceived = e.detail;

  rawDataSet = dataReceived.dataSet;
  groupAmount = dataReceived.groupAmount;

  console.log("Datos crudos: ", rawDataSet);
  console.log("Cantidad de grupos: ", groupAmount);

  calculateData();
  updateTable();
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
