function initializeComponent(buttonId, componentId) {
  const toggleButton = document.getElementById(buttonId);
  const toggleComponent = document.getElementById(componentId);

  toggleButton.addEventListener("click", () => {
    let isVisible = toggleComponent.classList.contains("visible");
    if (!isVisible) {
      toggleComponent.classList.toggle("visible");
    }
  });
}

initializeComponent("dataButton", "toggleable_container");
