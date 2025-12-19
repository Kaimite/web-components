# web-components
Test de mise en place de web components. 

Ce dépôt est là à des fins éducatives. Je suis en train de tester les web components et je met le code ici pour trace. 

Il peut être utilise librement.


## Code de vérification

Mise en place d'un formulaire pour la saisie des codes de vérifications. 

* Chaque lettre est séparée dans un champs spécifique. 
* Il est possible de copier-coller un code dans les champs. 
* L'appuie sur la touche Delete renvoie au champ précédent. 
* Quand on focus un champs son contenu est automatiquement sélectionné pour facilement remplacer sa valeur
* Une fois le dernier caractère sélectionné un evenement JS est lancé avec le code complet

### Customisation

Il est possible d'indiquer le nombre de champs à mettre en place ainsi que le nom des champs pour pouvoir les récupérer ensuite lors de la soumission d'un formulaire par exemple. 

Il est également possible de préciser une chaine pour le aria-label de chaque champs afin de prendre en compte l'accessibilite

### Exemple d'intégration : 

```
<code-verification field-name="verificationCode" nb-fields="6" aria-label-field="Code de vérification, caractère {{x}} sur {{y}}"></code-verification>

<script>
    document.querySelector('code-verification').addEventListener('code-complete', (event) => {
        console.log('Code saisi :', event.detail.code);
    });
</script>
```

## Simple slider

Slider très simple qui affiche et scroll une slide à la fois. 

### Exemple d'integration 

```
<simple-slider>
    <div class="slide">Slide 1</div>
    <div class="slide">Slide 2</div>
    <div class="slide">Slide 3</div>
</simple-slider>  
```