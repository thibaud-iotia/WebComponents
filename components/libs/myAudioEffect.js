const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

const URL_SERVER = "https://www.webaudiomodules.com/community/plugins.json";
const BASE_URL_SERVER = "https://www.webaudiomodules.com/community/plugins/";

export class MyAudioEffect extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style>
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
            #carousel {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin: 5px;
            }

        </style>

        <div id="mount">
            <select id="wamList">
            </select>
            <div id="carousel">
            </div>
        </div>
        `;
        this.audioContext = null;
        this.mount = this.shadowRoot.querySelector('#carousel');
        this.wimmicsPlugins = [];
        this.wamList = this.shadowRoot.querySelector('#wamList');
        this.wamList.addEventListener('change', this.loadPlugin);

    };
    connectedCallback(){
        console.log("myAudioEffect connected");
        this.buildAudioEffect('https://www.webaudiomodules.com/community/plugins/wimmics/blipper/index.js');
        this.initWamlibrary();

        //ecouter les clic de la souris sur le carousel pour le scroll
        this.mount.addEventListener('mousedown', this.startScroll);
        this.mount.addEventListener('mouseup', this.stopScroll);
        this.mount.addEventListener('mouseleave', this.stopScroll);

    };
    startScroll = (event) => {
        //pouvoir les element du carousel
        this.mount.style.cursor = "grabbing";
        this.mount.style.userSelect = "none";
        this.mount.style.overflowX = "scroll";
        this.mount.style.overflowY = "hidden";
        //recuperer la position de la souris
        this.startX = event.pageX - this.mount.offsetLeft;
        //recuperer la position du scroll
        this.scrollLeft = this.mount.scrollLeft;
        //ecouter le mouvement de la souris
        this.mount.addEventListener('mousemove', this.scroll);
    };
    scroll = (event) => {
        //recuperer la position de la souris
        const x = event.pageX - this.mount.offsetLeft;
        //calculer la distance parcourue
        const walk = (x - this.startX) * 3;
        //faire le scroll
        this.mount.scrollLeft = this.scrollLeft - walk;
    };
    stopScroll = () => {
        //arreter d'ecouter le mouvement de la souris
        this.mount.removeEventListener('mousemove', this.scroll);
        //remettre le style par defaut
        this.mount.style.cursor = "grab";
        this.mount.style.userSelect = "auto";
        this.mount.style.scrollBehavior = "auto";
        this.mount.style.overflowX = "hidden";
        this.mount.style.overflowY = "hidden";
    };
    initWamlibrary = async () =>{
        const reponse = await fetch(URL_SERVER);
        //mettre dans le json uniquement les réponses qui contiennent comme vendor "wimmics"
        const reponseJson = await reponse.json();
        this.wimmicsPlugins = reponseJson.filter(plugin => plugin.vendor === "Wimmics");
        this.wimmicsPlugins.forEach(plugin => {
            const option = document.createElement('option');
            option.value = BASE_URL_SERVER + plugin.path;
            option.textContent = plugin.name;
            this.wamList.appendChild(option);
        });
    };
    loadPlugin = (event) => {
        const url = event.target.value;
        this.buildAudioEffect(url);
    };
    setAudio(audioContext){
        this.audioContext = audioContext;
    };
    setSourceNode = (sourceNode) => {
        this.mediaElementSource = sourceNode;
    };
    // Very simple function to connect the plugin audionode to the host
    connectPlugin = (audioNode) => {
        this.mediaElementSource.connect(audioNode);
        audioNode.connect(this.audioContext.destination);
    };
    // Very simple function to append the plugin root dom node to the host 
    mountPlugin = (domNode) => {
        // this.mount.innerHtml = '';
        // //pour que se soit un carousel

        // this.mount.appendChild(domNode);

        //ajouter une div carousel-item qui contient le domNode
        const carouselItem = document.createElement('div');
        carouselItem.className = "carousel-item";
        carouselItem.appendChild(domNode);
        this.mount.appendChild(carouselItem);

    };
    buildAudioEffect = async (pluginUrl) => {
        // Initialiser WamEnv
    
        const { default: initializeWamHost } = await import(getBaseURL() + "../utils/sdk/src/initializeWamHost.js");
        const [hostGroupId] = await initializeWamHost(this.audioContext);
    
        // Importer WAM
        const { default: WAM } = await import(pluginUrl);
        // Créer une nouvelle instance du plugin
        // Vous pouvez éventuellement fournir plus d'options telles que l'état initial du plugin
        const instance = await WAM.createInstance(hostGroupId, this.audioContext);
    
        window.instance = instance;
    
        // Connecter le nœud audio à l'hôte
        this.connectPlugin(instance.audioNode);
    
        // Charger l'interface graphique si nécessaire (c'est-à-dire si l'option noGui a été définie sur true)
        // Et appelle la méthode createElement du module Gui
        const pluginDomNode = await instance.createGui();
    
        this.mountPlugin(pluginDomNode);
    };    
}
customElements.define('my-audio-effect', MyAudioEffect);