export class MyEqualizer extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({ mode: "open"});
        this.shadowRoot.innerHTML = `
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
        `;
        this.filters = [];
    }
    connectedCallback() {
        // On affiche le code qu'on a recupéré en attribut
        this.defineListeners();
        console.log("connected callback equalizer")
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

        // // on definit le noeud de sortie
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
        controls.forEach((control, id) => {
            control.oninput = (e) => {
                this.changeGain(e.target.value, id);
            }
        })
    }
}

customElements.define('my-equalizer', MyEqualizer);