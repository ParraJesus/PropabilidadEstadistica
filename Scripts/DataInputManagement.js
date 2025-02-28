const dataSummitButton = document.getElementById("dataButton");
const textAreaInput = document.getElementById("datasetInput");

function initializeInput(inputId) {
  const input = document.getElementById(inputId);

  input.addEventListener("input", function () {
    dataSummitButton.style.backgroundColor = "#E4794B";
  });
}

function getDataItems() {
  rawInputData = textAreaInput.value;
  const dataItems = rawInputData.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

  return dataItems;
}

function getInputData() {
  const onInputDataUpdated = new CustomEvent("inputDataUpdated", {
    detail: getDataItems(),
  });

  dataSummitButton.style.backgroundColor = "#79adc0";
  textAreaInput.value = getDataItems();
  document.dispatchEvent(onInputDataUpdated);
}

//esto es un comentario
initializeInput("datasetInput");
dataSummitButton.addEventListener("click", getInputData);
