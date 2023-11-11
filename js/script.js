window.onload = init;

let player, eq, currentSoundId;
function init() {
    console.log('page chargée');
    currentSoundId = 0;
    //get all files from assets/audio folder
    let files = [
        './assets/audio/CleanGuitarRiff.mp3',
        './assets/audio/laisseTomber.mp3'
    ];
    //an array which contains all sounds name (without extension)
    let sounds = [];
    files.forEach((file) => {
        let sound = file.split('/').pop().split('.')[0];
        sounds.push(sound);
    });
    
    
    player = document.querySelector('#myPlayer');
    //set src audio to player web component
    player.changeSrc(files[0]);
    player.loadSoundName(sounds)

    player.addEventListener('previousSound', () => {
        //si on est au premier son, on repart au dernier
        if(currentSoundId == 0)
            currentSoundId = files.length - 1;
        else
            currentSoundId--;
        player.changeSrc(files[currentSoundId]);
        //faire remonter un element un cran plus haut dans le tableau sounds
        sounds.unshift(sounds.pop());
        player.loadSoundName(sounds);
    });

    player.addEventListener('nextSound', () => {
        //si on est au dernier son, on repart au premier
        if(currentSoundId == files.length - 1)
            currentSoundId = 0;
        else
            currentSoundId++;
        player.changeSrc(files[currentSoundId]);
        //faire remonter un element un cran plus haut dans le tableau sounds
        sounds.unshift(sounds.pop());
        player.loadSoundName(sounds);
    });

}