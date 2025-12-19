class SimpleSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
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
        z-index: 1; /* Pour s'assurer que les boutons sont cliquables */
      }
      .prev { left: 10px; }
      .next { right: 10px; }
    </style>
    <div class="slider">
      <div class="slides">
        <slot id="slides-slot"></slot>
      </div>
      <button class="prev">Précédent</button>
      <button class="next">Suivant</button>
    </div>
  `;
}
  setupEventListeners() {
    const prevBtn = this.shadowRoot.querySelector('.prev');
    const nextBtn = this.shadowRoot.querySelector('.next');
    const slidesContainer = this.shadowRoot.querySelector('.slides');
    const slot = this.shadowRoot.querySelector('#slides-slot');

    // Écoute l'événement `slotchange` pour accéder aux slides
    slot.addEventListener('slotchange', () => {
      console.log('Slot changed');  
      this.slideItems = slot.assignedElements();
      this.slidesContainer = slidesContainer;
    });

    prevBtn.addEventListener('click', () => this.prevSlide());
    nextBtn.addEventListener('click', () => this.nextSlide());
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlider();
    }
  }

  nextSlide() {
    if (this.currentIndex < this.slideItems.length - 1) {
      this.currentIndex++;
      this.updateSlider();
    }
  }

  updateSlider() {
    if (this.slidesContainer) {
      this.slidesContainer.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
  }
}

customElements.define('simple-slider', SimpleSlider);