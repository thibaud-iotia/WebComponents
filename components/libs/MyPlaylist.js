const plusButton = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
</svg>`;
const playButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play" viewBox="0 0 16 16">
<path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
</svg>`;
const stopButtonSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-btn" viewBox="0 0 16 16">
<path d="M6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5h-3z"/>
<path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
</svg>`;
export class MyPlaylist extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML= `
        <style>
            .playList {
                background-color: #333333;
                padding: 10px;
                margin-left: auto; /* Aligner à droite */
            }
            .playList p {
                text-align: center;
                font-size: larger;
                color: #46b03a;
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
            #addSound {
                cursor: default;
                display: flex;
                justify-content: center;
            }
        </style>
        <div class="playList">
            <p>Vous n'avez ajoutez de musique</p>
        </div>
        `;
        this.files = [
        ];
    }
    connectedCallback() {
        console.log("connected callback playlist")
        //attendre la fin de setupIndexedDB pour charger les sons
        this.setupIndexedDB().then(() => {
            this.loadSound_localStorage();
        });
    }
    setupIndexedDB = async () => {
        // Ouvrir la base de données
        this.db = await this.openDatabase('MyAudioDatabase', 1);
    
        // Définir le schéma de la base de données et n'existe pas déjà
        if (this.db.version === 1 && !this.db.objectStoreNames.contains('MyAudio')) {
          this.db.createObjectStore('MyAudio', { keyPath: 'id', autoIncrement: true });
        }
    }
    openDatabase = async (name, version) => {
        return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);

        request.onerror = (event) => {
            reject(`Erreur lors de l'ouverture de la base de données: ${event.target.error}`);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            resolve(db);
        };
        });
    }
    saveData = (data) => {
        // Ouvrir une transaction en écriture
        const transaction = this.db.transaction('MyAudio', 'readwrite');

        // Accéder au magasin d'objets
        const store = transaction.objectStore('MyAudio');

        // Ajouter des données
        // const data = { name: 'John Doe', age: 30 };
        const request = store.add(data);

        request.onsuccess = () => {
            console.log('Données enregistrées avec succès!');
        };

        request.onerror = (event) => {
            console.error(`Erreur lors de l'enregistrement des données: ${event.target.error}`);
        };
    }
    //get all data from indexedDB
    getAllData = () => {
        return new Promise((resolve, reject) => {
            // Ouvrir une transaction en lecture seule
            const transaction = this.db.transaction('MyAudio', 'readonly');

            // Accéder au magasin d'objets
            const store = transaction.objectStore('MyAudio');

            // Obtenir toutes les données
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }

    loadSoundName(names) {
        //display sounds array name in playlist class
        const playList = this.shadowRoot.querySelector('.playList');
        if(names.length !== 0){
            playList.innerHTML = `<p>My playlist:</p><ul  id="items-list" class="moveable" style="padding-left: 0px;">
            ${names.map((sound) => `<li>${sound.name}</li>`).join('')}
            <li id="addSound">${plusButton}</li></ul>`;
            let items = this.shadowRoot.querySelectorAll('#items-list > li');
        
            items.forEach((item, index) => {
              item.draggable = true;
              item.addEventListener('dragstart', (e) => this.dragStart(e, index));
              item.addEventListener('drop', this.dropped);
              item.addEventListener('dragenter', this.cancelDefault);
              item.addEventListener('dragover', this.cancelDefault);
              item.addEventListener('click', this.selectSound);
            });
        }else{
            //si le tableau est vide on met juste le bouton +
            playList.innerHTML = `<p>My playlist:</p><ul  id="items-list" class="moveable" style="padding-left: 0px;">
            <li id="addSound">${plusButton}</li></ul>`;
        }

        //enlever le drag and drop sur le bouton +
        const addSound = this.shadowRoot.querySelector('#addSound');
        addSound.draggable = false;
        //desactiver la méthode selectSound sur le bouton +
        addSound.removeEventListener('click', this.selectSound);
        //ajoute le listener pour onclick sur le bouton +
        addSound.addEventListener('click', () => {
          //ouvrir une fenetre pour choisir un fichier
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'audio/*';
          input.onchange = async (e) => {
            const file = e.target.files[0];
            //convertir en base64 le fichier récupérer ;
            const reader = new FileReader();
            reader.readAsDataURL(file);

            const audioFile = await this.getBase64(file);
            //ajouter le fichier dans le tableau files
            this.files.push({name: file.name, url: audioFile});
            //save dans indexedDB
            this.saveData({name: file.name, url: audioFile});
    
            //afficher le nom du fichier dans la playlist
            this.loadSoundName(this.files);
            this.updatePlaylist();
          };
          input.click();
        });
        this.updatePlaylist();
    }
    updatePlaylist = (id = undefined) => {
        //ajouter la classe currentAudio au 1er l'element li 
        const playList = this.shadowRoot.querySelector('.playList');
        const items = playList.querySelectorAll('li');
    
        items.forEach((item, index) => {
            item.classList.remove('currentAudio');
        });
    
        if (id !== undefined && items[id]) {
            items[id].classList.add('currentAudio');
        } else {
            items[0].classList.add('currentAudio');
        }
    }
    
    getFiles() {
        return this.files;
    }
    setFiles(files) {
        this.files = files;
    }
    //récupérer le fichier en base64 de manière asynchrone
    async getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    loadSound_localStorage() {
        //récupérer le tableau files dans indexedDB
        this.getAllData().then((data) => {
            //ajouter les données dans le tableau files
            data.forEach((sound) => {
                this.files.push({name: sound.name, url: sound.url});
            });
            this.loadSoundName(this.files);
        });
    }
    dragStart(e, index) {
        e.dataTransfer.setData('text/plain', index);
    }
    selectSound = (e) => {
        const target = e.target;
        const index = this.getIndex(target);
        
        this.dispatchEvent(
          new CustomEvent('selectSound', {
            detail: index,
            bubbles: true, // Allows the event to bubble up through the shadow DOM boundary
            composed: true, // Allows the event to propagate across the shadow DOM boundary
        }));
        this.audioElement.play();
        this.play.innerHTML = stopButtonSVG;
        this.updatePlaylist(index);
    }
    dropped = (e) => {
        //pouvoir changer l'ordre des sons
        const target = e.target;
        const index = this.getIndex(target);
        const data = e.dataTransfer.getData('text/plain');
        const source = this.shadowRoot.querySelectorAll('#items-list > li')[data];
        const sourceIndex = this.getIndex(source);
        if (index > sourceIndex) {
          target.after(source);
        } else {
          target.before(source);
        }
        //mettre à jour l'index pour le changement d'ordre des sons
        const items = this.shadowRoot.querySelectorAll('#items-list > li');
        items.forEach((item, index) => {
            item.draggable = true;
            item.addEventListener('dragstart', (e) => this.dragStart(e, index));
            item.addEventListener('drop', this.dropped);
            item.addEventListener('dragenter', this.cancelDefault);
            item.addEventListener('dragover', this.cancelDefault);
        });
        //switch index element and sourceindex element in files array
        [this.files[index], this.files[sourceIndex]] = [this.files[sourceIndex], this.files[index]];
        this.audioElement.src = this.getFiles()[0].url;
        //update GUI play button
        this.play.innerHTML = playButtonSVG;
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

    setAudioElement(audioElement) {
        this.audioElement = audioElement;
    }
    setPlay(play) {
        this.play = play;
    }
}
customElements.define('my-playlist', MyPlaylist);