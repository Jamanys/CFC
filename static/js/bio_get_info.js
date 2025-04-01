document.addEventListener("DOMContentLoaded", function () {
    const select = document.getElementById("E-player-select");
    const bioInfoDiv = document.getElementById("E-Bio_infos");

    select.addEventListener("change", function () {
        const selectedPlayer = playersData.find(player => player.fullName === select.value);

        if (selectedPlayer) {
            bioInfoDiv.innerHTML = `
                <p> ${selectedPlayer.name} ${selectedPlayer.surname}</p>
                <p></p>
                <img src="${selectedPlayer.url}" alt="${selectedPlayer.surname} Pictures" style="width:100%;height:50%;">
                <p> ${selectedPlayer.position}</p>
                <p> ${selectedPlayer.height} cm</p>
                <p> ${selectedPlayer.weight} kg</p>
            `;
        } else {
            bioInfoDiv.innerHTML = "";
        }
    });
});
