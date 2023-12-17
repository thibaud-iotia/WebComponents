export class MyButterChurn extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
            }
            
            .butterchurn {
              width: 100%;
              height: 100%;
            }
            
            canvas {
              width: 100%;
              height: 100%;
            }
          </style>
          <div class="butterchurn">
              <canvas id='canvas' width='1600' height='1200'>
              </canvas>
          </div>
      `;
      this.started = this.getAttribute("started");
    }
  
    connectedCallback() {
      console.log("MyButterChurn connectedCallback");
      window.addEventListener('resize', this.handleResize.bind(this));
      this.loadScripts([
        "https://unpkg.com/lodash",
        "https://unpkg.com/butterchurn",
        "https://unpkg.com/butterchurn-presets",
        "https://unpkg.com/butterchurn-presets/lib/butterchurnPresetsExtra.min.js",
      ]).then(() => {
        this.handleResize(); 
        this.initPlayer();
      });
    }
  
    handleResize() {
      const canvas = this.shadowRoot.querySelector('#canvas');
      const rect = this.shadowRoot.querySelector('.butterchurn').getBoundingClientRect();
      this.canvasWidth = rect.width * (window.devicePixelRatio || 1);
      this.canvasHeight = rect.height * (window.devicePixelRatio || 1);
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;
    }
    getCanvasHeight() {
      return this.canvasHeight;
    }
    getCanvasWidth() {
      return this.canvasWidth;
    }

    changeStarted(newVal) {
      this.setAttribute("started", newVal);
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'started') {
        this.started = newValue;
      }
    }

    static get observedAttributes() {
      return ["started"];
    }
  
    async loadScripts(scriptUrls) {
      const loadScript = (url) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = url;
          script.onload = resolve;
          script.onerror = reject;
          this.shadowRoot.appendChild(script);
        });
      };
  
      const promises = scriptUrls.map((url) => loadScript(url));
      await Promise.all(promises);
    }
  
    async initPlayer() {
      this.presets = {};
      if (window.butterchurnPresets) {
        Object.assign(this.presets, butterchurnPresets.getPresets());
      }
      if (window.butterchurnPresetsExtra) {
        Object.assign(this.presets, butterchurnPresetsExtra.getPresets());
      }
      this.presets = Object.entries(this.presets).sort((a, b) =>
        a[0].toLowerCase().localeCompare(b[0].toLowerCase())
      ).reduce((acc, pair) => {
        acc[pair[0]] = pair[1];
        return acc;
      }, {});
      this.presetKeys = Object.keys(this.presets);
      this.presetIndex = Math.floor(Math.random() * this.presetKeys.length);
  
      this.sourceNode.connect(this.analyser);
  
      this.visualizer = butterchurn.default.createVisualizer(
        this.audioContext,
        this.shadowRoot.querySelector('#canvas'),
        {
          width: this.getCanvasWidth(),
          height: this.getCanvasHeight(),
          pixelRatio: window.devicePixelRatio || 1,
          textureRatio: 1,
        }
      );
  
      this.visualizer.connectAudio(this.analyser);
  
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  
      this.sourceNode.connect(this.audioContext.destination);
      this.nextPreset(0);
      this.startPresetCycle();
      //tout les x temps on change de preset
      setInterval(() => {
        this.nextPreset(10);
      }, 10000);
    }
  
    nextPreset(blendTime = 15.0) {
      const numPresets = this.presetKeys.length;
      if (this.presetRandom) {
        this.presetIndex = Math.floor(Math.random() * this.presetKeys.length);
      } else {
        this.presetIndex = (this.presetIndex + 1) % numPresets;
      }
  
      this.visualizer.loadPreset(this.presets[this.presetKeys[this.presetIndex]], blendTime);
    }
  
    startPresetCycle() {
      const renderLoop = () => {
        if (this.started === "true") {
          this.analyser.getByteFrequencyData(this.frequencyData);
          this.visualizer.render();
        }
        requestAnimationFrame(renderLoop);
      };
  
      renderLoop();
    }
  
    setAudioContext(context) {
      this.audioContext = context;
    }
  
    setSourceNode(sourceNode) {
      this.sourceNode = sourceNode;
    }

    setAnalyser(analyser) {
      this.analyser = analyser;
    }
  }
  
  customElements.define('butterchurn-visualizer', MyButterChurn);
  