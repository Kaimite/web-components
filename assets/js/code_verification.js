class CodeVerification extends HTMLElement {
    constructor() {
        super();
        this.fieldName = this.getAttribute('field-name') || 'defaultField';
        this.nbFields = parseInt(this.getAttribute('nb-fields')) || 4;
        this.ariaLabelField = this.getAttribute('aria-label-field') || 'Code de vérification {{x}} sur {{y}}';
        this.inputs = [];
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.createFields();
        this.createStyles();
    }

    disconnectedCallback() {
        // Supprimer tous les écouteurs des inputs
        this.inputs.forEach(input => {
            input.removeEventListener('paste', this.onPasteEvent);
            input.removeEventListener('input', this.onInputEvent);
            input.removeEventListener('keydown', this.onKeyDownEvent);
            input.removeEventListener('focus', this.onFocusEvent);
        });
        this.inputs = [];
    }

    createFields() {
        for (let i = 0; i < this.nbFields; i++) {
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('maxlength', '1');
            input.setAttribute('data-field-index', i);
            input.setAttribute('name', `${this.fieldName}[${i}]`);
            input.setAttribute('aria-label', this.ariaLabelField.replace('{{x}}', i + 1).replace('{{y}}', this.nbFields));

            // Écouteurs d'événements
            input.addEventListener('paste', this.onPasteEvent.bind(this));
            input.addEventListener('input', this.onInputEvent.bind(this)); 
            input.addEventListener('keydown', this.onKeyDownEvent.bind(this)); 
            input.addEventListener('focus', this.onFocusEvent.bind(this));
            this.shadowRoot.appendChild(input);
            this.inputs.push(input);
        }
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
        input {
            width: 20px;
            margin-right: 5px;
            text-align: center;
            border: 1px solid #ccc;
            font-size: 16px;
            padding: 5px;
            border-radius: 4px;
        }
        `;
        this.shadowRoot.appendChild(style);
    }

    onPasteEvent(event) {
        event.preventDefault();
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text').trim().substring(0, this.nbFields);

        for (let j = 0; j < this.nbFields; j++) {
            const targetInput = this.shadowRoot.querySelector(`input[data-field-index="${j}"]`);
            if (targetInput) {
                targetInput.value = pastedData[j] || '';
            }
        }

        // Focus sur le dernier champ rempli
        const lastFilledIndex = Math.min(pastedData.length - 1, this.nbFields - 1);
        this.focusField(lastFilledIndex);
        this.fireIsCompleteEvent();
    }

    onInputEvent(event) {
        const input = event.target;
        const index = parseInt(input.getAttribute('data-field-index'));

        // Si la valeur n'est pas un caractère unique valide, on l'ignore
        if (!/^[a-zA-Z0-9]$/.test(input.value)) {
            input.value = '';
            return;
        }

        // Passer au champ suivant
        if (index < this.nbFields - 1 && input.value) {
            this.focusField(index + 1);
        }
        this.fireIsCompleteEvent();
    }

    onKeyDownEvent(event) {
        const input = event.target;
        const index = parseInt(input.getAttribute('data-field-index'));

        // Gérer Backspace
        if (event.key === 'Backspace' && !input.value) {
            event.preventDefault();
            if (index > 0) {
                this.focusField(index - 1, true);
            }
        }
    }

    onFocusEvent(event) {
        const input = event.target;
        input.select();
    }

    focusField(index, clear = false) {
        const input = this.shadowRoot.querySelector(`input[data-field-index="${index}"]`);
        if (input) {
            input.focus();
            input.select();
            if (clear) {
                input.value = '';
            }
        }
    }

    fireIsCompleteEvent() {
        if (this.isComplete()) {
            this.dispatchEvent(new CustomEvent('code-complete', {
                detail: { code: this.getCode() }
            }));
        }
    }

    isComplete() {
        for (let i = 0; i < this.nbFields; i++) {
            const input = this.shadowRoot.querySelector(`input[data-field-index="${i}"]`);
            if (!input || !input.value) {
                return false;
            }
        }
        return true;
    }

    getCode() {
        return this.inputs.map(input => input.value).join('');
    }
}

customElements.define('code-verification', CodeVerification);
