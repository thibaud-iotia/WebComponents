/* create a web component with the name my-component,
that proposes to enter a keycode with button in a 3x3 matrix
*/
import "./libs/webaudiocontrols.js";
import "./myEqualizer.js";

const getBaseURL = () => {
  return new URL('.', import.meta.url);
};
//variable cho contain an svg image
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
      #timeRange {
        width: 300px;
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
      .myAudioPlayer {
        width: 800px; /* Ajustez la largeur selon vos besoins */
        margin: 20px auto;
        border: 2px solid #ccc;
        border-radius: 10px;
        overflow: hidden;
      }
      
      .container {
        display: flex;
        flex-direction: row; /* Modification de la direction en ligne */
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
      }
      
      .playList {
        background-color: #f0f0f0;
        padding: 10px;
        margin-left: auto; /* Aligner à droite */

      }
      // ul {
      //   list-style-type: none;
      //   margin: 0;
      //   padding: 0;
      //   width: 200px;
      //   background-color: #f1f1f1;
      // }
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
        color: #666;
        cursor: move;
      }
      
      ul.moveable li:hover {
        background-color: #eee;
      }
      
      .equalizer {
        background-color: #f0f0f0;
        padding: 10px;
        margin-right: auto; /* Aligner à gauche */
      }
      
    </style>
    <audio src="" id="player"></audio>
    <br>


    <div class="myAudioPlayer">
      <div class="container">
        <div class="equalizer">
          <my-equalizer id="myEqualizer"></my-equalizer>
          <label>Frequency</label>
          <input type="range" min="0" max="22050" step="1" value="350" id="biquadFilterFrequencySlider" />
          <label>Detune</label>
          <input type="range" min="0" max="100" step="1" value="0" id="biquadFilterDetuneSlider" />
          <label>Q</label>
          <input type="range" min="0.0001" max="1000" step="0.01" value="1" id="biquadFilterQSlider" />
          <label>Type</label>
          <select id="biquadFilterTypeSelector">
              <option value="lowpass" selected>lowpass</option>
              <option value="highpass">highpass</option>
              <option value="bandpass">bandpass</option>
              <option value="lowshelf">lowshelf</option>
              <option value="highshelf">highshelf</option>
              <option value="peaking">peaking</option>
              <option value="notch">notch</option>
              <option value="allpass">allpass</option>
          </select>
        </div>
        <div class="display">
          <div class="audioGraph"> 
            <progress type="range" id="timeRange" min="0" value="0"> </progress>
            <div class="timer">
              <span id="currentTimeDisplay">0:00</span> / <span id="durationDisplay">0:00</span>
            </div>
          </div>
          <div class="analyser">
            <canvas id="myCanvas" width=300 height=100></canvas>
          </div>
        </div>
        <div class="playList">
          <p>My playlist</p>
          <ul>
            <li>musique 1</li>
            <li>musique 2</li>
            <li>musique 3</li>
          </ul>
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
        value="50" step="1" 
        diameter="100" 
        tooltip="Volume %d">
        </webaudio-knob>
        <webaudio-knob id="balanceKnob"
        src="./images/sound.png" 
        value="0" step="0.1" min="-1" max="1"
        diameter="100" 
        tooltip="Balance %d">
        </webaudio-knob>
      </div>
    </div>
    `;

    this.src = this.getAttribute('src');
    this.audioElement = this.shadowRoot.querySelector('#player');
    this.timeRangeInput = this.shadowRoot.querySelector('#timeRange');
    let canvas = this.shadowRoot.querySelector('#myCanvas');
    this.width = canvas.width;
    this.height = canvas.height;

    this.canvasContext = canvas.getContext('2d');

    this.buildAudioGraph();

    
    this.audioElement.src = this.src;
    this.currentTimeDisplay = this.shadowRoot.querySelector('#currentTimeDisplay');
    this.durationDisplay = this.shadowRoot.querySelector('#durationDisplay');
    this.soundKnob = this.shadowRoot.querySelector("#soundKnob");

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

    //to put images 
    this.baseURL = getBaseURL();
  }

  connectedCallback() {
    // On affiche le code qu'on a recupéré en attribut
    this.defineListeners();
    console.log("connected callback")
    requestAnimationFrame(() => this.visualize());
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
  visualize() {
    // clear the canvas
    this.canvasContext.clearRect(0, 0, this.width, this.height);
    
    // Get the analyser data
    this.analyser.getByteFrequencyData(this.dataArray);

    let barWidth = this.width / this.bufferLength;
    let barHeight;
    let x = 0;
  
    // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
    // before drawing. This is the scale factor
    let heightScale = this.height/128;

    for(let i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i];


      this.canvasContext.fillStyle = 'rgb(' + (barHeight - 10) + ',209,109)';
      barHeight *= heightScale;
      this.canvasContext.fillRect(x, this.height-barHeight/2, barWidth, barHeight/2);

      // 2 is the number of pixels between bars
      x += barWidth + 1;
    }
    
    // call again the visualize function at 60 frames/s
    requestAnimationFrame(() => this.visualize());
    
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

    this.filterNode = this.audioContext.createBiquadFilter();
    
    this.sourceNode.connect(this.filterNode);
    
    this.filterNode.connect(this.audioContext.destination);
    this.pannerNode = this.audioContext.createPanner();
    this.pannerNode.connect(this.audioContext.destination);
    this.lastNode = this.pannerNode;

    // Create an analyser node
    this.analyser = this.audioContext.createAnalyser();
    
    // Try changing for lower values: 512, 256, 128, 64...
    this.analyser.fftSize = 32;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    //initialiser l'audio pour myEqualizer
    const myEqualizer = this.shadowRoot.querySelector('#myEqualizer');
    myEqualizer.setContext(this.audioContext, this.getSourceNode());
  }

  connect(inputNode, outputNode) {
    // ex: inputNode est le premier d'une equalizer
    // et outputNode est le dernier d'un equalizer
    this.lastNode.connect(inputNode);
    outputNode.connect(this.audioContext.destination);
  }

  changeSrc(code) {
    // IMPORTANT : rappel, l'attribut doit être en minuscules !
    this.setAttribute('src', code);
  }

  loadSoundName(names) {
    //display sounds array name in playlist class
    const playList = this.shadowRoot.querySelector('.playList');
    playList.innerHTML = `<p>My playlist:</p><ul  id="items-list" class="moveable">
    ${names.map((sound) => `<li>${sound}</li>`).join('')}
    </ul>`;
    let items = this.shadowRoot.querySelectorAll('#items-list > li');

    items.forEach((item, index) => {
      item.draggable = true;
      item.addEventListener('dragstart', (e) => this.dragStart(e, index));
      item.addEventListener('drop', this.dropped);
      item.addEventListener('dragenter', this.cancelDefault);
      item.addEventListener('dragover', this.cancelDefault);
    });
  }
  dragStart(e, index) {
    e.dataTransfer.setData('text/plain', index);
  }
  
  dropped = (e) => {
    this.cancelDefault(e);
  
    // get new and old index
    let oldIndex = e.dataTransfer.getData('text/plain');
    const target = e.target;
    let newIndex = this.getIndex(target);
  
    // Ensure the target has a parentNode before proceeding
    if (target.parentNode) {
      console.log(target.parentNode);
      // remove dropped items at old place
      let dropped = target.parentNode.removeChild(target);
      console.log(target);
  
      // insert the dropped items at new place
      if (newIndex < oldIndex) {
        target.parentNode.insertBefore(dropped, target);
      } else {
        target.parentNode.insertBefore(dropped, target.nextSibling);
      }
    }
  };
  
  getIndex = (element) => {
    let index = 0;
    while ((element = element.previousElementSibling) !== null) {
      index++;
    }
    return index;
  }
  
  cancelDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  
  // declare l'attribut "correctcode" comme étant "observé"
  static get observedAttributes() {
    return ["src"];
  }

  // Quand un attribut observé est modifié on entre dabs ce callback
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src') {
      this.audioElement.src = newValue;
    }
  }

  getContext() {
    return this.audioContext;
  }

  getSourceNode() {
    return this.sourceNode;
  }

  defineListeners() {
    const play = this.shadowRoot.querySelector("#playBtn");
    const moveForward = this.shadowRoot.querySelector('#moveForward');
    const moveBackward = this.shadowRoot.querySelector("#moveBackward");
    const balanceKnob = this.shadowRoot.querySelector("#balanceKnob");
    const previousSound = this.shadowRoot.querySelector("#previousSound");
    const nextSound = this.shadowRoot.querySelector("#nextSound");
    

    //pour controler le son
    const biquadFilterFrequencySlider = this.shadowRoot.querySelector('#biquadFilterFrequencySlider');
    const biquadFilterDetuneSlider = this.shadowRoot.querySelector('#biquadFilterDetuneSlider');
    const biquadFilterQSlider = this.shadowRoot.querySelector('#biquadFilterQSlider');
    const biquadFilterTypeSelector = this.shadowRoot.querySelector('#biquadFilterTypeSelector');

    //pour controler le son
    this.soundKnob.addEventListener('input', (evt) => {
      this.audioElement.volume = evt.target.value / 100;
    });
    //to control the balance
    // balanceKnob.addEventListener('input', (evt) => {
    //   this.stereoPaner.pan.value = evt.target.value;
    // });

    // on ajoute les listeners sur les boutons
    previousSound.onclick = () => {
      this.dispatchEvent(
        new CustomEvent('previousSound', {
          bubbles: true, // Allows the event to bubble up through the shadow DOM boundary
          composed: true, // Allows the event to propagate across the shadow DOM boundary
      }));
      this.audioElement.play();
    }
    nextSound.onclick = () => {
      this.dispatchEvent(
        new CustomEvent('nextSound', {
          bubbles: true, // Allows the event to bubble up through the shadow DOM boundary
          composed: true, // Allows the event to propagate across the shadow DOM boundary
      }));
      this.audioElement.play();
    }
    play.onclick = () => {
      //regarder si l'audio est en pause ou en play
      if (this.audioElement.paused) {
        this.audioElement.play();
        play.innerHTML = stopButtonSVG;
      }else{
        play.innerHTML = playButtonSVG;
        this.audioElement.pause();
      }
    }

    moveBackward.onclick = () => {
      this.audioElement.currentTime = this.audioElement.currentTime - 2;
    }

    moveForward.onclick = () => {
      this.audioElement.currentTime = this.audioElement.currentTime + 2;
    }

    //Pour controler le son
    biquadFilterFrequencySlider.oninput = (evt) => {
      this.filterNode.frequency.value = parseFloat(evt.target.value);
    };
    
    biquadFilterDetuneSlider.oninput = (evt) => {
      this.filterNode.detune.value = parseFloat(evt.target.value);
    };
    
    biquadFilterQSlider.oninput = (evt) => {
      this.filterNode.Q.value = parseFloat(evt.target.value);
    };
    
    biquadFilterTypeSelector.onchange = (evt) => {
      this.filterNode.type = evt.target.value;
    };
  }
}

customElements.define('my-audio-player', MyAudioPlayer);
