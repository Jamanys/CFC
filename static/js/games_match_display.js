document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");

    select.addEventListener("change", function () {
        const selectedPlayer = playersData.find(player => player.fullName === select.value);
        const player_id = selectedPlayer.pid
        fetch("../static/csv/CFC GPS Data.csv")
            .then(response => response.text())
            .then(data => {
                const lines = data.split("\n");
                const header = lines[0].split(",");
            
                const filteredLines = lines.slice(1).filter(line => {
                    const columns = line.split(",");
                    const oppositionCode = columns[header.indexOf("opposition_code")];
                    const dateStr = columns[header.indexOf("date")];
                    const pidRow = columns[header.indexOf("pid")];
                    // Convertir la date au format JJ/MM/AAAA en un format que JavaScript peut comprendre
                    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
                    const date = new Date(year, month - 1, day);  // mois commence à 0 en JavaScript
                    return oppositionCode && date && (pidRow == player_id);
                });

                // Filtrer et trier les matchs avant la date limite
                const beforeDate = filteredLines.filter(line => {
                    const dateStr = line.split(",")[header.indexOf("date")];
                    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
                    const date = new Date(year, month, day);  // mois commence à 0 en JavaScript
                    return date < new Date("2025-04-13");
                })
                .sort((a, b) => {
                    const dateStrA = a.split(",")[header.indexOf("date")];
                    const [dayA, monthA, yearA] = dateStrA.split("/").map(num => parseInt(num, 10));
                    const dateA = new Date(yearA, monthA, dayA);

                    const dateStrB = b.split(",")[header.indexOf("date")];
                    const [dayB, monthB, yearB] = dateStrB.split("/").map(num => parseInt(num, 10));
                    const dateB = new Date(yearB, monthB, dayB);

                    return dateA - dateB;  // Trie du plus ancien au plus récent
                })
                .slice(0, 4);  // Récupérer les 4 premiers matchs

                // Récupérer le premier match après la date limite
                const afterDate = filteredLines.find(line => {
                    const dateStr = line.split(",")[header.indexOf("date")];
                    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
                    const date = new Date(year, month, day); // mois commence à 0 en JavaScript
                    return date > new Date("2025-04-13");
                });

                // Fusionner les deux ensembles de données : avant et après la date
                const mergedData = beforeDate.concat(afterDate ? [afterDate] : []);
                console.log("Données fusionnées:", mergedData);

                // Sélectionner la div pour l'affichage
                const divElement = document.getElementById("E-games");

                // Afficher les matchs dans la div
                output = ``
                mergedData.forEach(line => {
                    const columns = line.split(",");

                    // Extraire les valeurs nécessaires : opposition_code, date et distance
                    const oppositionCode = columns[header.indexOf("opposition_code")];
                    const dateStr = columns[header.indexOf("date")];
                    const distance = parseFloat(columns[header.indexOf("distance")]) / 1000;  // Convertir en km et arrondir

                    // Formater la date au format "dd/mm"
                    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
                    const formattedDate = `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month}`;

                    // Ajouter le contenu de chaque match
                    output += `
                    <div id="F-game">
                        <p><strong>Opposition :</strong> ${oppositionCode}</p>
                        <p><strong>Date :</strong> ${formattedDate}</p>
                        <p><strong>Distance :</strong> ${distance.toFixed(1)} km</p>
                    </div>
                    `;
                });
            if (mergedData.length === 0) {
                output = "<p>No game played or planed for this player</p>";
            }
            divElement.innerHTML = output
        });
    })
});