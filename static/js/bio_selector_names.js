let playersData = []; // Stocker les données des joueurs

document.addEventListener("DOMContentLoaded", function () {
    fetch("../static/csv/AS Player Infos.csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split("\n");
            const header = lines[0].split(",");

            const nameIndex = header.indexOf("name");
            const surnameIndex = header.indexOf("surname");
            const positionIndex = header.indexOf("position");
            const heightIndex = header.indexOf("height");
            const weightIndex = header.indexOf("weight");
            const urlIndex = header.indexOf('img_url');

            if ([nameIndex, surnameIndex, positionIndex, heightIndex, weightIndex].includes(-1)) {
                console.error("Colonnes manquantes dans le fichier CSV.");
                return;
            }

            const select = document.getElementById("E-player-select");

            lines.slice(1).forEach(line => {
                const columns = line.split(",");
                if (columns.length > Math.max(nameIndex, surnameIndex)) {
                    const player = {
                        fullName: `${columns[nameIndex]} ${columns[surnameIndex]}`.trim(),
                        name: columns[nameIndex],
                        surname: columns[surnameIndex],
                        position: columns[positionIndex],
                        height: columns[heightIndex],
                        weight: columns[weightIndex],
                        url: columns[urlIndex]
                    };

                    playersData.push(player);

                    let option = document.createElement("option");
                    option.value = player.fullName;
                    option.textContent = player.fullName;
                    select.appendChild(option);
                }
            });
        })
        .catch(error => console.error("Erreur lors du chargement du fichier CSV :", error));
});
