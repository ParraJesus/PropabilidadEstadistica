const summitButton = document.getElementById("dataButton");
const textAreaInput = document.getElementById("datasetInput");
const textInput = document.getElementById("groupAmountInput");

function initializeInput(input) {
  input.addEventListener("input", function () {
    summitButton.style.backgroundColor = "#E4794B";
  });
}

//Optener los datos del textarea
function getDataItems() {
  rawInputData = textAreaInput.value;
  const dataItems = rawInputData.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

  return dataItems;
}

function getInputData() {
  const data = {
    dataSet: getDataItems(),
    groupAmount: parseInt(textInput.value),
  };

  const onTabulationInputDataUpdated = new CustomEvent(
    "tabulationInputDataUpdated",
    {
      detail: data,
    }
  );

  summitButton.style.backgroundColor = "#79adc0";
  textAreaInput.value = getDataItems();
  document.dispatchEvent(onTabulationInputDataUpdated);
}

initializeInput(textInput);
initializeInput(textAreaInput);

summitButton.addEventListener("click", getInputData);
