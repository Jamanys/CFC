document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("E-player-select");
    const bioInfoDiv = document.getElementById("E-Bio_infos");
    setTimeout(function (){
        load_data(select,bioInfoDiv)
    }, 50);

    select.addEventListener("change", function () {
        load_data(select,bioInfoDiv)
    });
});


function load_data(select,bioInfoDiv){
    const selectedPlayer = playersData.find(player => player.fullName === select.value);
    
    if (selectedPlayer) {
        bioInfoDiv.innerHTML = `
            <h3>${selectedPlayer.fullName}</h3>
            <img src="${selectedPlayer.url}" alt="${selectedPlayer.surname} Picture" class="player-img">
            <p>Position : ${selectedPlayer.position}</p>
            <p>Height : ${selectedPlayer.height} cm</p>
            <p>Weight : ${selectedPlayer.weight} kg</p>
        `;
    } else {
        bioInfoDiv.innerHTML = "";
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