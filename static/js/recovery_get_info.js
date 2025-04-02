document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");

    select.addEventListener("change", function () {
        const selectedPlayer = playersData.find(player => player.fullName === select.value);
        if (!selectedPlayer) return; // Sécurité si le joueur n'existe pas
        
        const player_id = selectedPlayer.pid;

        const today_day = new Date("2025-03-13");
        const oneWeekAgo = new Date(today_day);
        oneWeekAgo.setDate(today_day.getDate() - 7);
        const twoWeekAgo = new Date(today_day);
        twoWeekAgo.setDate(today_day.getDate() - 14);

        console.log(
            today_day.toISOString().split("T")[0],
            oneWeekAgo.toISOString().split("T")[0],
            twoWeekAgo.toISOString().split("T")[0]
        );

        fetch("../static/csv/CFC Recovery status Data.csv")
            .then(response => response.text())
            .then(data => {
                const lines = data.split("\n");
                const header = lines[0].split(",");

                // Vérifier que les indices existent
                const valueIndex = header.indexOf("value");
                const dateIndex = header.indexOf("sessionDate");
                const pidIndex = header.indexOf("pid");
                
                if (valueIndex === -1 || dateIndex === -1 || pidIndex === -1) {
                    console.error("Colonnes introuvables dans le fichier CSV.");
                    return;
                }

                const filteredLines = lines.slice(1).filter(line => {
                    const columns = line.split(",");
                    const value_ = columns[valueIndex];
                    const dateStr = columns[dateIndex];
                    const pidRow = columns[pidIndex];

                    if (!value_ || !dateStr || !pidRow) return false; // Vérification des valeurs

                    const date = parseDate(dateStr);
                    return (date > twoWeekAgo) && (pidRow == player_id);
                });

                const old_data = filteredLines.filter(line => {
                    const dateStr = line.split(",")[dateIndex];
                    const date = parseDate(dateStr);
                    return date <= oneWeekAgo;
                });

                const new_data = filteredLines.filter(line => {
                    const dateStr = line.split(",")[dateIndex];
                    const date = parseDate(dateStr);
                    return date > oneWeekAgo;
                });
                const emb_o = getAverageByMetric(old_data, "emboss_baseline_score", header);
                const emb_n = getAverageByMetric(new_data, "emboss_baseline_score", header);
                const sub_o = getAverageByMetric(old_data, "subjective_baseline_composite", header);
                const sub_n = getAverageByMetric(new_data, "subjective_baseline_composite", header);
                const mskL_n = getAverageByMetric(new_data, "msk_load_tolerance_baseline_composite", header);
                const mskJ_n = getAverageByMetric(new_data, "msk_joint_range_baseline_composite", header);
                const msk_n = Math.round((mskL_n + mskJ_n)*100/2)/100
                const mskL_o = getAverageByMetric(old_data, "msk_load_tolerance_baseline_composite", header);
                const mskJ_o = getAverageByMetric(old_data, "msk_joint_range_baseline_composite", header);
                const msk_o = Math.round((mskL_o + mskJ_o)*100/2)/100
                const sle_o = getAverageByMetric(old_data, "sleep_baseline_composite", header);
                const sle_n = getAverageByMetric(new_data, "sleep_baseline_composite", header);
                const bio_o = getAverageByMetric(old_data, "bio_baseline_composite", header);
                const bio_n = getAverageByMetric(new_data, "bio_baseline_composite", header);
                
                const output = `
                    <div id="F-text">
                        <p>\n</p>
                        <p><strong> 7 day mean :</strong></p>
                        <p><strong> Last week status :</strong></p>
                    </div>
                    <div id="F-rec-stats">
                        <p>Emboss</p>
                        <p><strong>new :</strong> ${emb_n}</p>
                        <p><strong>old :</strong> ${emb_o}</p>
                    </div>
                    <div id="F-rec-stats">
                        <p>Subjective</p>
                        <p><strong>new :</strong> ${sub_n}</p>
                        <p><strong>old :</strong> ${sub_o}</p>
                    </div>
                    <div id="F-rec-stats">
                        <p>Muscles</p>
                        <p><strong>new :</strong> ${msk_n}</p>
                        <p><strong>old :</strong> ${msk_o}</p>
                    </div>
                    <div id="F-rec-stats">
                        <p>Sleep</p>
                        <p><strong>new :</strong> ${sle_n}</p>
                        <p><strong>old :</strong> ${sle_o}</p>
                    </div>
                    <div id="F-rec-stats">
                        <p>Bio</p>
                        <p><strong>new :</strong> ${bio_n}</p>
                        <p><strong>old :</strong> ${bio_o}</p>
                    </div>
                    `;
                
                const divElement = document.getElementById("E-recovery");
                divElement.innerHTML = output

            });
    });
});

// Correction du parsing de date
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
    return new Date(year, month -1, day); // Fix du problème de mois
}

function getAverageByMetric(data, metricName, header) {
    // Filtrer les lignes où la colonne "metric" correspond à metricName
    const filteredData = data.filter(line => {
        const columns = line.split(",");
        return columns[header.indexOf("metric")] === metricName;
    });

    // Extraire les valeurs de la colonne "value" et calculer la moyenne
    const values = filteredData.map(line => {
        const columns = line.split(",");
        return parseFloat(columns[header.indexOf("value")]); // Convertir en nombre
    }).filter(val => !isNaN(val)); // Exclure les valeurs invalides

    if (values.length === 0) return null; // Retourner null si aucune donnée valide

    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round(sum*10000 / values.length)/100;
}
