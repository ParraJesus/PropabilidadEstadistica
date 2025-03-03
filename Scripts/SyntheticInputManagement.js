const summitButton = document.getElementById("dataButton");
const textAreaInput = document.getElementById("datasetInput");
const groupInput = document.getElementById("groupAmountInput");
const dataAmountInput = document.getElementById("syntheticDataAmountInput");

function initializeInput(input) {
  input.addEventListener("input", function () {
    summitButton.style.backgroundColor = "#E4794B";
  });
}

function getDataItems() {
  rawInputData = textAreaInput.value;
  const dataItems = rawInputData.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

  return dataItems;
}

function getInputData() {
  const data = {
    dataSet: getDataItems(),
    groupAmount: parseInt(groupInput.value),
    dataAmount: parseInt(dataAmountInput.value),
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

initializeInput(groupInput);
initializeInput(textAreaInput);
initializeInput(dataAmountInput);

summitButton.addEventListener("click", getInputData);
