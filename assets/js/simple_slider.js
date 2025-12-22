class SimpleSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentIndex = 0;
    this.hasControls = false;
    this.slideItems = [];
    this.prevButton = null;
    this.nextButton = null;
  }

  connectedCallback() {
    this.hasControls = this.hasAttribute("with-controls");
    if (this._deviceHasTouchscreen() && !this.hasControls) {
        this._renderTouchscreen();
    } else {
      this._renderHasMouse();
      this._attachEventListeners();
    }
  }

  _renderTouchscreen() {
    this.shadowRoot.innerHTML = `
    <style>
      .slider {
        position: relative;
        overflow: scroll;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-wrap: nowrap;
        scroll-snap-type: x mandatory;
      }
      /* Cible les slides insérées via le slot */
      ::slotted(.slide) {
        scroll-snap-align: start;
        min-width: 100%;
        box-sizing: border-box; /* Pour éviter les débordements */
      }
    </style>
    <div class="slider">
      <slot id="slides-slot"></slot>
    </div>
  `;
  }

  _renderHasMouse() {
    this.shadowRoot.innerHTML = `
    <style>
      .slider {
        position: relative;
        overflow: hidden;
        width: 100%;
        margin: 0 auto;
      }
      .slides {
        display: flex;
        transition: transform 0.3s ease;
      }
      /* Cible les slides insérées via le slot */
      ::slotted(.slide) {
        min-width: 100%;
        box-sizing: border-box; /* Pour éviter les débordements */
      }
      button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: #333;
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1; /* Pour s'assurer que les boutons sont cliquables */

        &:disabled {
          background: #777;
          cursor: not-allowed;
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }
      .prev { left: 10px; }
      .next { right: 10px; }
    </style>
    <div class="slider">
      <div class="slides">
        <slot id="slides-slot"></slot>
      </div>
      <button class="prev" aria-label="Précédent">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clip-rule="evenodd" />
        </svg>
      </button>
      <button class="next" aria-label="Suivant">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `;
  }

  _attachEventListeners() {
    this.prevButton = this.shadowRoot.querySelector(".prev");
    this.nextButton = this.shadowRoot.querySelector(".next");
    
    const slidesContainer = this.shadowRoot.querySelector(".slides");
    const slot = this.shadowRoot.querySelector("#slides-slot");

    // Écoute l'événement `slotchange` pour accéder aux slides
    slot.addEventListener("slotchange", () => {
      this.slideItems = slot.assignedElements();
      this.slidesContainer = slidesContainer;
      this._setButtonsState();
    });

    this.prevButton.addEventListener("click", () => this.prevSlide());
    this.nextButton.addEventListener("click", () => this.nextSlide());
  }

  _detachEventListeners() {
    this.prevButton.removeEventListener("click", () => this.prevSlide());
    this.nextButton.removeEventListener("click", () => this.nextSlide());
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._updateSlider();
    }
  }

  nextSlide() {
    if (this.currentIndex < this.slideItems.length - 1) {
      this.currentIndex++;
      this._updateSlider();
    }
  }

  _updateSlider() {
    if (this.slidesContainer) {
      this.slidesContainer.style.transform = `translateX(-${
        this.currentIndex * 100
      }%)`;
      if (this.hasControls) {
        this._setButtonsState();
      }
    }
  }

  _setButtonsState() {
    this.prevButton.disabled = this.currentIndex === 0;
    this.nextButton.disabled = this.currentIndex === this.slideItems.length - 1;
  }

  _deviceHasTouchscreen() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  disconnectedCallback() {
    if ( this.hasControls ) {
        this._detachEventListeners();
    }
  }
}

customElements.define("simple-slider", SimpleSlider);
