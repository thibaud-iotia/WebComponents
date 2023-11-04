window.onload = init;

let player, eq;
function init() {
    console.log('page chargée');
    player = document.querySelector('#myPlayer');
    eq = document.querySelector('#myEqualizer');
    eq.setContext(player.getContext(), player.getSourceNode());

    player.connect(eq.inputNode, eq.outputNode);

}