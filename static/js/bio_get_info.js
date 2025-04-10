document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("E-player-select");
    const bioPict = document.getElementById("E-player_picture");

    setTimeout(function (){
        load_data(select,bioPict)
    }, 50);

    select.addEventListener("change", function () {
        load_data(select,bioPict)
    });
});


function load_data(select,bioPict){
    const selectedPlayer = playersData.find(player => player.fullName === select.value);
    
    if (selectedPlayer) {
        bioPict.innerHTML = `
        <h3>${selectedPlayer.fullName}</h3>
        <img src="${selectedPlayer.url}" alt="${selectedPlayer.surname} Picture" class="player-img"></img>
        `;
    } else {
        bioPicts.innerHTML = "";
    }
}

// Remplissage du select avec les joueurs
const selectElement = document.getElementById("E-player-select");
playersData.forEach(player => {
    const option = document.createElement("option");
    option.value = player.fullName;
    option.textContent = player.fullName;
    selectElement.appendChild(option);
});