import "./libs/webaudiocontrolsKnobs.js";
import "./libs/myEqualizer.js";
import "./libs/MyPlaylist.js";
import "./libs/myAudioEffect.js";
import "./libs/myAnalyser.js";
import './libs/myButterChurn.js';

const getBaseURL = () => {
  return new URL('.', import.meta.url);
};
const playButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play" viewBox="0 0 16 16">
<path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
</svg>`;

const stopButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-btn" viewBox="0 0 16 16">
<path d="M6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5h-3z"/>
<path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
</svg>`;

export class MyAudioPlayer extends HTMLElement {
  src = ``;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
    <style>
      .audioGraph {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      #currentTimeDisplay {
        margin-right: 1em;
      }
      #durationDisplay {
        margin-left: 1em;
      }
      .buttonAction {
        display: flex;
        flex-direction: row;
        justify-content: center;
      }
      .buttonAction button {
        background-color: #333;
        color: white;
        padding: 10px;
        margin: 0 5px;
        cursor: pointer;
      }
      .buttonAction button:hover {
        background-color: #46b03a;
      }
      .myAudioPlayer {
        width: 800px; /* Ajustez la largeur selon vos besoins */
        margin: 20px auto;
        border: 2px solid #ccc;
        border-radius: 10px;
        overflow: hidden;
      }
      .timer span {
        color: #c7c7c7;
      }
      .container {
        display: flex;
        flex-direction: row;
      }
      
      .controls {
        background-color: #333;
        color: white;
        padding: 10px;
        text-align: center;
      }
      
      .display {
        flex-grow: 1;
        padding: 20px;
        text-align: center;
        background-color: #333333;
      }
      
      .playList {
        background-color: #333333;
        padding: 10px;
        margin-left: auto;
      }
      .playList p {
        text-align: center;
        font-size: larger;
        color: #46b03a;
      }
      .currentAudio{
        background-color: #46b03a
      }
      [draggable="true"] {
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
      }
      
      ul.moveable {
        list-style: none;
        margin: 0px;
      }
      
      ul.moveable li {
        list-style-image: none;
        margin: 10px;
        border: 1px solid #ccc;
        padding: 4px;
        border-radius: 4px;
        color: #c7c7c7;
        cursor: move;
      }
      
      ul.moveable li:hover {
        background-color: #eee;
      }
      
      .equalizer {
        background-color: #333333;
        padding: 10px;
        margin-right: auto; /* Aligner à gauche */
      }
      #timeRange {
        width: 300px;
        background: #333;
      }
      #addSound {
        cursor: default;
        display: flex;
        justify-content: center;
      }
      .primary-container {
        position: relative;
      }
      
      .myAudioPlayer,
      .myButterChurn {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }
      
      .myAudioPlayer {
        z-index: 2;
        width: 800px;
        margin: 20px auto;
        border: 2px solid #ccc;
        border-radius: 10px;
        overflow: hidden;
      }
      
      .myButterChurn {
        z-index: 1;
        top: 100%;
        width: 100%;
      }
      

    </style>
    <audio src="" id="player"></audio>
    <div class= "primary-container">
      <div class="myButterChurn">
        <butterchurn-visualizer id="myButterChurn" started=false></butterchurn-visualizer>
      </div>
      <div class="myAudioPlayer">
      <div class="container">
        <div class="equalizer">
          <my-equalizer id="myEqualizer"></my-equalizer>
        </div>
        <div class="display">
          <div class="audioGraph"> 
            <progress type="range" id="timeRange" min="0" value="0"> </progress>
            <div class="timer">
              <span id="currentTimeDisplay">0:00</span> <span>/</span> <span id="durationDisplay">0:00</span>
            </div>
          </div>
          <div class="analyser">
            <my-analyser id="myAnalyser"></my-analyser>
          </div>
        </div>
        <div class="playList">
          <my-playlist id="myPlaylist"></my-playlist>
        </div>
      </div>
      <div class="controls">
        <div class="buttonAction">
          <button id="previousSound">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-skip-backward" viewBox="0 0 16 16">
            <path d="M.5 3.5A.5.5 0 0 1 1 4v3.248l6.267-3.636c.52-.302 1.233.043 1.233.696v2.94l6.267-3.636c.52-.302 1.233.043 1.233.696v7.384c0 .653-.713.998-1.233.696L8.5 8.752v2.94c0 .653-.713.998-1.233.696L1 8.752V12a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm7 1.133L1.696 8 7.5 11.367V4.633zm7.5 0L9.196 8 15 11.367V4.633z"/>
            </svg>
          </button>
          <button id="moveBackward">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-skip-backward-btn" viewBox="0 0 16 16">
            <path d="M11.21 5.093A.5.5 0 0 1 12 5.5v5a.5.5 0 0 1-.79.407L8.5 8.972V10.5a.5.5 0 0 1-.79.407L5 8.972V10.5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 1 0v1.528l2.71-1.935a.5.5 0 0 1 .79.407v1.528l2.71-1.935z"/>
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
            </svg>
          </button>
          <button id="playBtn">${playButtonSVG}</button>  
          <button id="moveForward">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fast-forward-btn" viewBox="0 0 16 16">
            <path d="M8.79 5.093A.5.5 0 0 0 8 5.5v1.886L4.79 5.093A.5.5 0 0 0 4 5.5v5a.5.5 0 0 0 .79.407L8 8.614V10.5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5Z"/>
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4Z"/>
            </svg>
          </button>
          <button id="nextSound">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-skip-forward" viewBox="0 0 16 16">
            <path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.752l-6.267 3.636c-.52.302-1.233-.043-1.233-.696v-2.94l-6.267 3.636C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696L7.5 7.248v-2.94c0-.653.713-.998 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5zM1 4.633v6.734L6.804 8 1 4.633zm7.5 0v6.734L14.304 8 8.5 4.633z"/>
            </svg>
          </button>
        </div>
        <webaudio-knob id="soundKnob"
        src="./images/sound.png" 
        value="2" step="1" 
        diameter="100" 
        tooltip="Volume %d">
        </webaudio-knob>
        <webaudio-knob id="balanceKnob"
        src="./images/sound.png" 
        value="0" step="0.1" min="-1" max="1"
        diameter="100" 
        tooltip="Balance %d">
        </webaudio-knob>
        <my-audio-effect id="myAudioEffect" audiocontext="" sourcenode=""></my-audio-effect>
      </div>
    </div>
    </div>
    `;
    this.db = null;
    this.audioElement = this.shadowRoot.querySelector('#player');
    this.timeRangeInput = this.shadowRoot.querySelector('#timeRange');

    this.buildAudioGraph();

    
    this.audioElement.src = this.src;
    this.currentTimeDisplay = this.shadowRoot.querySelector('#currentTimeDisplay');
    this.durationDisplay = this.shadowRoot.querySelector('#durationDisplay');
    this.soundKnob = this.shadowRoot.querySelector("#soundKnob");
    this.play = this.shadowRoot.querySelector("#playBtn");

    // set la valeur max du input range en fonction de la durée de l'audio au chargement
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.timeRangeInput.max = this.audioElement.duration;
      this.updateAudioDuration();
      this.audioElement.volume = this.soundKnob.value / 100;
    });
    // Mettre à jour la valeur de l'input range en fonction du currentTime de l'audio
    this.audioElement.addEventListener('timeupdate', () => {
      this.timeRangeInput.value = this.audioElement.currentTime;
      // Mettre à jour l'affichage du temps actuel
      const currentTimeMinutes = Math.floor(this.audioElement.currentTime / 60);
      const currentTimeSeconds = Math.floor(this.audioElement.currentTime % 60);
      this.currentTimeDisplay.textContent = `${currentTimeMinutes}:${currentTimeSeconds < 10 ? '0' : ''}${currentTimeSeconds}`;
      this.updateAudioDuration();
    });
    //detecter le clic sur l'element progress
    this.timeRangeInput.addEventListener('click', this.updateProgressBar);
    //detecter le press clic sur l'element progress
    this.timeRangeInput.addEventListener('mousedown', () => {
      this.timeRangeInput.addEventListener('mousemove', this.updateProgressBar);
      //quand le clic est relaché, on enleve l'event listener
      this.timeRangeInput.addEventListener('mouseup', () => {
        this.timeRangeInput.removeEventListener('mousemove', this.updateProgressBar);
      });
    });

    //mettre des images 
    this.baseURL = getBaseURL();

    //initialiser la playlist 
    this.myPlaylist = this.shadowRoot.querySelector('#myPlaylist');
    let defaultPlaylist = null;
    if (this.getAttribute('src').length > 0){
      const sounds = this.getAttribute('src').split(',');
      defaultPlaylist = sounds.map((sound) => {
        return { name: sound.split('/').pop(), url: sound };
      });
      this.myPlaylist.setFiles(defaultPlaylist);
    }
    this.myPlaylist.loadSoundName(this.myPlaylist.getFiles());
    this.myPlaylist.setAudioElement(this.audioElement);
    this.myPlaylist.setPlay(this.play);
  }

  connectedCallback() {
    // On affiche le code qu'on a recupéré en attribut
    this.defineListeners();
    console.log("connected callback")
    // requestAnimationFrame(() => this.visualize());
    this.changeRelativeURLsToAbsolute();
  }


  changeRelativeURLsToAbsolute() {
    let elements = this.shadowRoot.querySelectorAll('img, webaudio-knob, webaudio-switch');
    
    elements.forEach((e) => {
      let elementPath = e.getAttribute('src');
      // if the image path isn't already absolute, make it absolute
      if (elementPath.indexOf('://') === -1)
        e.src = getBaseURL() + '/' + elementPath;
    });
  }
  updateAudioDuration() {
    // Mettre à jour l'affichage de la durée totale
    const durationMinutes = Math.floor(this.audioElement.duration / 60);
    const durationSeconds = Math.floor(this.audioElement.duration % 60);
    this.durationDisplay.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
  }
  buildAudioGraph(){
    //pour controler le son 
    this.audioContext = new AudioContext();
    this.audioElement.onplay = (e) => {this.audioContext.resume();}

    this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);

    this.stereoPaner = this.audioContext.createStereoPanner();

    this.sourceNode.connect(this.stereoPaner);
    this.stereoPaner.connect(this.audioContext.destination);
    
    this.pannerNode = this.audioContext.createPanner();
    this.pannerNode.connect(this.audioContext.destination);
    this.lastNode = this.pannerNode;

    //initialiser l'audio pour myEqualizer
    const myEqualizer = this.shadowRoot.querySelector('#myEqualizer');
    myEqualizer.setContext(this.audioContext, this.getSourceNode());
    //initialiser l'audio pour myAudioEffect
    const myAudioEffect = this.shadowRoot.querySelector('#myAudioEffect');
    myAudioEffect.setAudio(this.audioContext);
    myAudioEffect.setSourceNode(this.getSourceNode());

    //initialiser l'analyser 
    const myAnalyser = this.shadowRoot.querySelector('#myAnalyser');
    //convertir audioContext en string pour pouvoir le passer en attribut
    myAnalyser.setAudioContext(this.audioContext);
    myAnalyser.setSourceNode(this.getSourceNode());
    myAnalyser.buildAudioGraph();

    //initialiser myButterChurn
    this.myButterChurn = this.shadowRoot.querySelector('#myButterChurn');
    this.myButterChurn.setAudioContext(this.audioContext);
    this.myButterChurn.setSourceNode(this.getSourceNode());
    this.myButterChurn.setAnalyser(myAnalyser.getAnalyser());
  }
  getFiles() {
    return this.myPlaylist.getFiles();
  }
  connect(inputNode, outputNode) {
    this.lastNode.connect(inputNode);
    outputNode.connect(this.audioContext.destination);
  }

  changeSrc(url) {
    // IMPORTANT : rappel, l'attribut doit être en minuscules !
    this.setAttribute('src', url);
  }
  //fonction pour modifier la valeur de l'element progress
  updateProgressBar = (e) => {
    const progress = this.shadowRoot.querySelector('#timeRange');
    const { duration } = this.audioElement;
    const progressTime = (e.offsetX / progress.offsetWidth) * duration;
    this.audioElement.currentTime = progressTime;
  }
  
  
  // declare l'attribut "correctcode" comme étant "observé"
  static get observedAttributes() {
    return ["src"];
  }

  // Quand un attribut observé est modifié on entre dabs ce callback
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src') {
      this.audioElement.src = newValue;
      if(oldValue === null){
        this.audioElement.src = newValue.split(',')[0];
      }
    }
  }

  getContext() {
    return this.audioContext;
  }

  getSourceNode() {
    return this.sourceNode;
  }

  getMyplaylist() {
    return this.myPlaylist;
  }

  doNextSound = () => {
    this.getFiles().unshift(this.getFiles().pop());
    this.changeSrc(this.getFiles()[0].url);
    this.myPlaylist.loadSoundName(this.getFiles());
    // this.myPlaylist.updatePlaylist();
    this.audioElement.play();
  }
  defineListeners() {
    const moveForward = this.shadowRoot.querySelector('#moveForward');
    const moveBackward = this.shadowRoot.querySelector("#moveBackward");
    const balanceKnob = this.shadowRoot.querySelector("#balanceKnob");
    const previousSound = this.shadowRoot.querySelector("#previousSound");
    const nextSound = this.shadowRoot.querySelector("#nextSound");
    
    //pour controler le son
    this.soundKnob.addEventListener('input', (evt) => {
      this.audioElement.volume = evt.target.value / 100;
    });
    //to control the balance
    balanceKnob.addEventListener('input', () => {
      this.stereoPaner.pan.setValueAtTime(balanceKnob.value, this.audioContext.currentTime);
    });

    // on ajoute les listeners sur les boutons
    previousSound.onclick = () => {
      this.getFiles().push(this.getFiles().shift());
      this.changeSrc(this.getFiles()[0].url);
      this.myPlaylist.loadSoundName(this.getFiles());
      this.audioElement.play();
      this.play.innerHTML = stopButtonSVG;
    }
    nextSound.onclick = () => {
      this.doNextSound();
      this.play.innerHTML = stopButtonSVG;
    }
    this.play.onclick = () => {
      //regarder si l'audio est en pause ou en play
      if (this.audioElement.paused) {
        this.audioElement.play();
        this.play.innerHTML = stopButtonSVG;
      }else{
        this.play.innerHTML = playButtonSVG;
        this.audioElement.pause();
      }
      this.myButterChurn.changeStarted(!this.audioElement.paused);
    }
    //ecouter l'evenement "selectSound" de myPlaylist
    this.myPlaylist.addEventListener('selectSound', ( { detail } ) => {
      let index = detail;
      let file = this.getFiles()[index];
      this.changeSrc(file.url);
      this.myPlaylist.loadSoundName(this.getFiles());
      // this.myPlaylist.updatePlaylist(index);
      this.audioElement.play();
      this.play.innerHTML = stopButtonSVG;
      //il faut que le son joué ne soit pas rejouable avec les boutons next et previous 
      //donc on le met en premier dans le tableau
      this.getFiles().unshift(this.getFiles().splice(index, 1)[0]);
    });
    //A la fin de la musique, on passe à la suivante
    this.audioElement.addEventListener('ended', () => {
      this.doNextSound();
    });

    moveBackward.onclick = () => {
      this.audioElement.currentTime = this.audioElement.currentTime - 10;
    }

    moveForward.onclick = () => {
      this.audioElement.currentTime = this.audioElement.currentTime + 10;
    }
  }
}

customElements.define('my-audio-player', MyAudioPlayer);
