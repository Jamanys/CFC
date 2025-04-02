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
    console.log('start bgi')
    const selectedPlayer = playersData.find(player => player.fullName === select.value);
    console.log(selectedPlayer)
    if (selectedPlayer) {
        console.log(1)
        bioInfoDiv.innerHTML = `
            <p></p>
            <img src="${selectedPlayer.url}" alt="${selectedPlayer.surname} Pictures" style="width:100%;height:50%;">
            <p> ${selectedPlayer.position}</p>
            <p> ${selectedPlayer.height} cm</p>
            <p> ${selectedPlayer.weight} kg</p>
        `;
    } else {
        console.log(2)
        bioInfoDiv.innerHTML = "";
    }
console.log('end bgi')
}
