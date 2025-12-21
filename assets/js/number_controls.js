class NumberControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.inputField = null;
    this.incrementButton = null;
    this.decrementButton = null;
  }

  connectedCallback() {
    const htmlAttributes = Object.entries(this._getFieldsAttributes())
      .filter(([key, value]) => value !== "")
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    const isRequired = this.hasAttribute("required") ? "required" : "";
    const isReadOnly = this.hasAttribute("readonly") ? "readonly" : "";

    this.shadowRoot.innerHTML = `
        <style>
            input {
                width: var(--number-control-input-width, 2em);
                text-align: var(--number-control-input-text-align, center);
            }
        </style>
        <div>
            <button id="decrement" aria-label="Decrement">-</button>
            <input data-js-selector="number-control-input-field" type="number" ${htmlAttributes} ${isRequired} ${isReadOnly} />
            <button id="increment" aria-label="Increment">+</button>
        </div>
    `;

    this.inputField = this.shadowRoot.querySelector(
      '[data-js-selector="number-control-input-field"]'
    );
    this.incrementButton = this.shadowRoot.getElementById("increment");
    this.decrementButton = this.shadowRoot.getElementById("decrement");

    this._attachEventListeners();
    this._checkValue();
    this._checkButtonsState();
  }

  _attachEventListeners() {
    this.inputField.addEventListener("input", () => this._onInputHandler());
    this.incrementButton.addEventListener("click", () =>
      this._incrementValue()
    );
    this.decrementButton.addEventListener("click", () =>
      this._decrementValue()
    );
  }

  _detachEventListeners() {
    this.inputField.removeEventListener("input", () => this._onInputHandler());
    this.incrementButton.removeEventListener("click", () =>
      this._incrementValue()
    );
    this.decrementButton.removeEventListener("click", () =>
      this._decrementValue()
    );
  }

  _incrementValue() {
    this._calculateValue("increment");
  }

  _decrementValue() {
    this._calculateValue("decrement");
  }

  _onInputHandler() {
    this._checkValue();
    this._checkButtonsState();
  }

  _calculateValue(operation) {
    const step = parseFloat(this.inputField.step) || 1;
    let newValue = parseFloat(this.inputField.value) || 0;

    if (operation === "increment") {
      const max =
        this.inputField.max !== "" ? parseFloat(this.inputField.max) : null;
      newValue = this._fixVirgule(newValue + step);
      if (max !== null && newValue > max) {
        newValue = max;
      }
    } else {
      const min =
        this.inputField.min !== "" ? parseFloat(this.inputField.min) : null;
      newValue = this._fixVirgule(newValue - step);
      if (min !== null && newValue < min) {
        newValue = min;
      }
    }
    this.inputField.value = newValue;
    this.inputField.dispatchEvent(new Event("input", { bubbles: true }));
    this.dispatchEvent(new CustomEvent("numberControls.change", {
        detail: { value: newValue }
    }));
  }

  _checkButtonsState() {
    const currentValue = parseFloat(this.inputField.value) || 0;
    const max =
      this.inputField.max !== "" ? parseFloat(this.inputField.max) : null;
    const min =
      this.inputField.min !== "" ? parseFloat(this.inputField.min) : null;

    this.incrementButton.disabled = max !== null && currentValue >= max;
    this.decrementButton.disabled = min !== null && currentValue <= min;
  }

  _checkValue() {
    if (isNaN(parseFloat(this.inputField.value))) {
      return;
    }

    const initialInputValue = parseFloat(this.inputField.value);
    const max =
      this.inputField.max !== "" ? parseFloat(this.inputField.max) : null;
    const min =
      this.inputField.min !== "" ? parseFloat(this.inputField.min) : null;

    if (max !== null && initialInputValue > max) {
      this.inputField.value = max;
    } else if (min !== null && initialInputValue < min) {
      this.inputField.value = min;
    }
  }

  /* Correction erreurs de virgule flottante en JS */
  _fixVirgule(value) {
    const decimals = (
      this.shadowRoot
        .querySelector('[data-js-selector="number-control-input-field"]')
        .step.split(".")[1] || ""
    ).length;
    return parseFloat(value.toFixed(decimals));
  }

  _getFieldsAttributes() {
    return {
      name: this.getAttribute("name") || "",
      id: this.getAttribute("id") || "",
      step: this.getAttribute("step") || "1",
      placeholder: this.getAttribute("placeholder") || "",
      list: this.getAttribute("list") || "",
      min: this.getAttribute("min") || "",
      max: this.getAttribute("max") || "",
      value: this.getAttribute("value") || "",
      "aria-label": this.getAttribute("aria-label") || "",
    };
  }

  checkValidity() {
    return this.inputField.checkValidity();
  }

  reportValidity() {
    return this.inputField.reportValidity();
  }

  getValue() {
    return this.inputField.value;
  }

  disconnectedCallback() {
    this._detachEventListeners();
  }
}

customElements.define("number-controls", NumberControls);
