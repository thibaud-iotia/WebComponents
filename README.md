# WebComponents
## Présentation 
Ceci est un petit projet sur le thème des Web components natifs.

Ce projet a été réalisé dans le cadre de l'UE Technologies du Web en Master 2 MIAGE INTENSE animé par M. BUFFA Michel.

L'objectif du projet était donc de réaliser plusieurs Web components à l'intérieur d'un seul même composant afin de l'utiliser où bon nous semble.

Le thème du cours était de personnaliser la balise HTML "audio" en utilisant la bibliothèque AudioContext ([documentation](https://developer.mozilla.org/fr/docs/Web/API/AudioContext)), du HTML, du CSS et du JS.

## Références 
Pour mener à bien ce projet, je me suis basé sur les cours de M. BUFFA Michel ([ici](https://www.edx.org/learn/html5/the-world-wide-web-consortium-w3c-html5-apps-and-games)), ainsi que sur des Web components déjà préfabriqués ([webaudio controls](https://github.com/g200kg/webaudio-controls)) et des [WebAudioModules](https://www.webaudiomodules.com/community/plugins.json).

## Documentation 
Pour utiliser le Web component, vous pouvez aussi bien télécharger ce projet et l'exécuter ou prendre uniquement le dossier "components" et inclure le fichier "myAudioPlayer.js" dans votre page web, par exemple : `<script src="components/myAudioPlayer.js" type="module"></script>` et faire appel à la balise : `<my-audio-player id="myPlayer" src="./assets/audio/CleanGuitarRiff.mp3,./assets/audio/Eminem - Godzilla ft. Juice WRLD.mp3,./assets/audio/Imagine_Dragons_Bones.mp3,./assets/audio/Måneskin_BABY SAID.mp3"></my-audio-player>`. Entre chaque fichier audio, il faut qu'il y ait une virgule.

Vous avez la possibilité d'ajouter vos musiques à votre guise grâce au bouton "+" au niveau de la playlist.

### Option(s) du composant:
- id : permet de pouvoir le récupérer dans un fichier JS/TS
- src : contient le lien vers votre fichier (pas obligatoire)

Via ce Web component, vous aurez la possibilité d'ajouter d'autres musiques à votre playlist. Ces musiques seront stockées dans l'IndexedDB de votre navigateur.

### Effet visuel
Pour apporter un effet visuel, le projet se base sur [Butterchurn](https://github.com/jberg/butterchurn?). Dès que la musique commence à être jouée, un effet aléatoire apparaît et change régulièrement.

### Liste des Web components 
* myAudioPlayer (Composant principal)
  * myAnalyser
  * myAudioEffect
  * myButterChurn
  * myEqualizer
  * MyPlaylist

## Explications 
![présentation du projet](assets/img/doc.png)
