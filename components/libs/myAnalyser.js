export class MyAnalyser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <style>
      </style>
      <canvas id="myCanvas" width=300 height=100></canvas>
    `;
    let canvas = this.shadowRoot.querySelector('#myCanvas');
    this.width = canvas.width;
    this.height = canvas.height;
    this.canvasContext = canvas.getContext('2d');
  }
  connectedCallback(){
    console.log('MyAnalyser connected');
    requestAnimationFrame(() => this.visualize());
  }
  visualize() {
    this.canvasContext.clearRect(0, 0, this.width, this.height);
    
    this.analyser.getByteFrequencyData(this.dataArray);

    let barWidth = this.width / this.bufferLength;
    let barHeight;
    let x = 0;
  
    let heightScale = this.height/128;

    for(let i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i];


      this.canvasContext.fillStyle = 'rgb(' + (barHeight - 10) + ',209,109)';
      barHeight *= heightScale;
      this.canvasContext.fillRect(x, this.height-barHeight/2, barWidth, barHeight/2);

      x += barWidth + 1;
    }
    
    requestAnimationFrame(() => this.visualize());
  }
  buildAudioGraph(){
    this.analyser = this.audioContext.createAnalyser();

    this.analyser.fftSize = 32;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    
    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }
  setAudioContext(audioContext){
    this.audioContext = audioContext;
  }
  setSourceNode(sourceNode){
    this.sourceNode = sourceNode;
  }
  getAnalyser(){
    return this.analyser;
  }
}
customElements.define('my-analyser', MyAnalyser);