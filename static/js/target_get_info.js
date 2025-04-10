document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");
    setTimeout(function (){
        get_target_info(select)
    }, 50);
    select.addEventListener("change", function () {
        get_target_info(select)
    })
});


function get_target_info(select){
    const selectedPlayer = playersData.find(player => player.fullName === select.value);
    if (!selectedPlayer) return; // Sécurité si le joueur n'existe pas

    const player_id = selectedPlayer.pid;
    const today = new Date("2025-03-14")

    fetch("../static/csv/CFC Individual Priority Areas.csv")
    .then(response => response.text())
    .then(rawData => {
        const lines = rawData.trim().split("\n");
        const header = lines[0].split(",");

        // Indices des colonnes
        const pidIndex = header.indexOf("pid");
        const reviewDateIndex = header.indexOf("Review Date");
        const targetIndex = header.indexOf("Target");
        const trackingIndex = header.indexOf("Tracking");

        if (pidIndex === -1 || reviewDateIndex === -1 || targetIndex === -1) {
            console.error("Colonnes manquantes dans le CSV");
            return;
        }

        // Convertir en tableau d'objets
        const data = lines.slice(1).map(line => {
            const cols = line.split(",");
            return {
                pid: parseInt(cols[pidIndex], 10),
                reviewDate: new Date(cols[reviewDateIndex]), // Conversion en date
                target: cols[targetIndex],
                tracking: cols[trackingIndex]
            };
        });

        // Filtrer par pid == 1
        const filteredData = data.filter(row => (row.pid == player_id) && !isNaN(row.reviewDate) && (new Date(row.reviewDate)>today));

        // Trier par date d'expiration (plus proches en premier)
        filteredData.sort((a, b) => b.reviewDate - a.reviewDate);

        // Prendre les 3 premiers
        const top3Targets = filteredData.slice(0, 3);

        // Afficher les objectifs dans la div C-targets
        const targetDiv = document.getElementById("C-targets");
        targetDiv.innerHTML = top3Targets.map(row => {
            const formattedDate = row.reviewDate.toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' });

            // Définition des icônes selon la valeur de `tracking`
            let trackingIcon = "";
            if (row.tracking === "Achieved") trackingIcon = "💪";
            else if (row.tracking === "On Track") trackingIcon = "🏃";
            else if (row.tracking === "Miss") trackingIcon = "❌";

            return `
                <div id="D-target-card">
                    <p class="target">${row.target}</p>
                    <p class="date"><span class="icon">⏰ :</span> ${formattedDate}</p>
                    <p class="tracking">${trackingIcon} ${row.tracking}</p>
                </div>`;
        }).join("");
    })
    .catch(error => console.error("Erreur lors du chargement du CSV :", error));
}
        