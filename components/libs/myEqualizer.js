
const getBaseURL = () => {
    return new URL('.', import.meta.url);
};
export class MyEqualizer extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({ mode: "open"});
        this.shadowRoot.innerHTML = `
        <style>
        .controls {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin: 5px;
        }
        label {
            color: #c7c7c7;
            width: 50px;
            margin-right: 10px;
        }
        output {
            color: #c7c7c7;
            width: 100px;
            margin-left: 10px;
        }
        input[type=range] {
            -webkit-appearance: none;
            margin: 10px 0;
            width: 100%;
        }
        input[type=range]:focus {
            outline: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 8.4px;
            cursor: pointer;
            animate: 0.2s;
            box-shadow: 1px 1px 1px #000000;
            background: #46b03a;
            border-radius: 1.3px;
            border: 0.2px solid #010101;
        }
        input[type=range]::-webkit-slider-thumb {
            box-shadow: 0.8px 0.8px 0px #000000;
            border: 1px solid #000000;
            height: 20px;
            width: 16px;
            border-radius: 3px;
            background: #ffffff;
            cursor: pointer;
            -webkit-appearance: none;
            margin-top: -6.8px;
        }
        select {
            width: 100%;
            height: 30px;
            margin: 10px 0;
            background-color: #333333;
            color: #c7c7c7;
        }
        option {
            background-color: #333333;
            color: #c7c7c7;
        }
        
        </style>
        <div class="controls">
            <label>60Hz</label>
            <input type="range" value="0" step="1" min="-30" max="30" ></input>
            <output id="gain0">0 dB</output>
        </div>
        <div class="controls">
            <label>170Hz</label>
            <input type="range" value="0" step="1" min="-30" max="30" ></input>
            <output id="gain1">0 dB</output>
        </div>
        <div class="controls">
            <label>350Hz</label>
            <input type="range" value="0" step="1" min="-30" max="30" ></input>
            <output id="gain2">0 dB</output>
        </div>
        <div class="controls">
            <label>1000Hz</label>
            <input type="range" value="0" step="1" min="-30" max="30" ></input>
            <output id="gain3">0 dB</output>
        </div>
        <div class="controls">
            <label>3500Hz</label>
            <input type="range" value="0" step="1" min="-30" max="30" ></input>
            <output id="gain4">0 dB</output>
        </div>
        <div class="controls">
            <label>10000Hz</label>
            <input type="range" value="0" step="1" min="-30" max="30" ></input>
            <output id="gain5">0 dB</output>
        </div>
        <label>Detune</label>
        <input type="range" min="0" max="100" step="1" value="0" id="biquadFilterDetuneSlider" />
        <label>Q</label>
        <input type="range" min="0.0001" max="1000" step="0.01" value="1" id="biquadFilterQSlider" />
        <label>Type</label>
        <select id="biquadFilterTypeSelector">
            <option value="lowpass" selected>Lowpass</option>
            <option value="highpass">Highpass</option>
            <option value="bandpass">Bandpass</option>
            <option value="lowshelf">Lowshelf</option>
            <option value="highshelf">Highshelf</option>
            <option value="peaking">Peaking</option>
            <option value="notch">Notch</option>
            <option value="allpass">Allpass</option>
        </select>
        `;
        this.filters = [];
        this.baseURL = getBaseURL();
    }
    connectedCallback() {
        // On affiche le code qu'on a recupéré en attribut
        this.defineListeners();
        console.log("connected callback equalizer")
        this.changeRelativeURLsToAbsolute();
    }
    changeRelativeURLsToAbsolute() {
        let elements = this.shadowRoot.querySelectorAll('img, webaudio-knob, webaudio-switch, webaudio-slider');
        
        elements.forEach((e) => {
          let elementPath = e.getAttribute('src');
          // if the image path isn't already absolute, make it absolute
          if (elementPath.indexOf('://') === -1)
            e.src = getBaseURL() + '/' + elementPath;
        });
    }
    setContext(ctx, sourceNode) {
        this.ctx = ctx;
        this.buildAudioGraph(ctx, sourceNode);
    }
    setFilters(filters) {
        this.filters = filters;
    }
    buildAudioGraph(ctx, sourceNode) {
        let filtersArray = [];
        // Set filters
        [60, 170, 350, 1000, 3500, 10000].forEach(function(freq, i) {
            let eq = ctx.createBiquadFilter();
            eq.frequency.value = freq;
            eq.type = "peaking";
            eq.gain.value = 0;
            filtersArray.push(eq);
        });
        this.setFilters(filtersArray);

        // Connect filters in serie
        sourceNode.connect(this.filters[0]);
        for(let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i+1]);
        }

        // connect the last filter to the speakers
        this.filters[this.filters.length - 1].connect(ctx.destination);

        this.filterNode = ctx.createBiquadFilter();
        sourceNode.connect(this.filterNode);
    
        this.filterNode.connect(ctx.destination);

        // on definit le noeud de sortie
        this.inputNode = this.filters[0];
        this.outputNode = this.filters[this.filters.length - 1];
    }
    changeGain(sliderVal,nbFilter) {
        let value = parseFloat(sliderVal);
        this.filters[nbFilter].gain.value = value;
        
        // update output labels
        let output = this.shadowRoot.querySelector("#gain"+nbFilter);
        output.value = value + " dB";
    }
    defineListeners(){
        const controls = this.shadowRoot.querySelectorAll(".controls");
        //pour controler le son
        const biquadFilterDetuneSlider = this.shadowRoot.querySelector('#biquadFilterDetuneSlider');
        const biquadFilterQSlider = this.shadowRoot.querySelector('#biquadFilterQSlider');
        const biquadFilterTypeSelector = this.shadowRoot.querySelector('#biquadFilterTypeSelector');
        controls.forEach((control, id) => {
            control.oninput = (e) => {
                this.changeGain(e.target.value, id);
            }
        })
        //Pour controler le son
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

customElements.define('my-equalizer', MyEqualizer);