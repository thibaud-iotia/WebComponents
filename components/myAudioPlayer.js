/* create a web component with the name my-component,
that proposes to enter a keycode with button in a 3x3 matrix
*/
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
    </style>
    <audio src="" id="player"></audio>
    <div class="audioGraph"> 
      <progress type="range" id="timeRange" min="0" value="0"> </progress>
      <div class="timer">
        <span id="currentTimeDisplay">0:00</span> / <span id="durationDisplay">0:00</span>
      </div>
    </div>

    <div class="buttonAction">
      <button id="lessSound">-</button>
      <button id="moveBackward"><<</button>
      <button id="playBtn">Play</button>  
      <button id="moveForward">>></button> 
      <button id="moreSound">+</button>
    </div>

    <br>
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
    <div class="analyser">
      <canvas id="myCanvas" width=300 height=100></canvas>
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

    // set la valeur max du input range en fonction de la durée de l'audio au chargement
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.timeRangeInput.max = this.audioElement.duration;
      this.updateAudioDuration();
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
  }
  visualize() {
    // clear the canvas
    this.canvasContext.clearRect(0, 0, this.width, this.height);
    
    // Or use rgba fill to give a slight blur effect
    //canvasContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
    //canvasContext.fillRect(0, 0, width, height);
    
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


      this.canvasContext.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
      barHeight *= heightScale;
      this.canvasContext.fillRect(x, this.height-barHeight/2, barWidth, barHeight/2);

      // 2 is the number of pixels between bars
      x += barWidth + 1;
    }
    
    // call again the visualize function at 60 frames/s
    requestAnimationFrame(() => this.visualize());
    
  }


  connectedCallback() {
    // On affiche le code qu'on a recupéré en attribut
    this.defineListeners();
    console.log("connected callback")
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
  }

  connect(inputNode, outputNode) {
    // ex: inputNode est le premier d'une equalizer
    // et outputNode est le dernier d'un equalizer
    this.lastNode.connect(inputNode);
    outputNode.connect(this.audioContext.destination);
  }

  changeCode(code) {
    // IMPORTANT : rappel, l'attribut doit être en minuscules !
    this.setAttribute('src', code);
  }

  // declare l'attribut "correctcode" comme étant "observé"
  static get observedAttributes() {
    return ["src"];
  }

  // Quand un attribut observé est modifié on entre dabs ce callback
  attributeChangedCallback(name, oldValue, newValue) {
    //console.log("Dans attributeChangedCallback")

    if (name === 'src') {
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
    // const pause = this.shadowRoot.querySelector('#pauseBtn');
    const moveForward = this.shadowRoot.querySelector('#moveForward');
    const moveBackward = this.shadowRoot.querySelector("#moveBackward");
    const lessSound = this.shadowRoot.querySelector('#lessSound');
    const moreSound = this.shadowRoot.querySelector("#moreSound");

    //pour controler le son
    const biquadFilterFrequencySlider = this.shadowRoot.querySelector('#biquadFilterFrequencySlider');
    const biquadFilterDetuneSlider = this.shadowRoot.querySelector('#biquadFilterDetuneSlider');
    const biquadFilterQSlider = this.shadowRoot.querySelector('#biquadFilterQSlider');
    const biquadFilterTypeSelector = this.shadowRoot.querySelector('#biquadFilterTypeSelector');


    // on ajoute les listeners sur les boutons
    play.onclick = () => {
      if (play.textContent === 'Play') {
        this.audioElement.play();
        play.textContent = 'Pause';
      }else{
        play.textContent = 'Play';
        this.audioElement.pause();
      }
    }

    // pause.onclick = () => {
    //   this.audioElement.pause();
    // }

    moveBackward.onclick = () => {
      this.audioElement.currentTime = this.audioElement.currentTime - 2;
    }

    moveForward.onclick = () => {
      this.audioElement.currentTime = this.audioElement.currentTime + 2;
    }

    lessSound.onclick = () => {
      if (this.audioElement.volume <= 0) {
        this.audioElement.volume = 0;
        return;
      }
      this.audioElement.volume = this.audioElement.volume - 0.2;
      console.log(this.audioElement.volume);
    }

    moreSound.onclick = () => {
      if (this.audioElement.volume >= 1) return;
      this.audioElement.volume = this.audioElement.volume + 0.2;
      console.log(this.audioElement.volume);
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
