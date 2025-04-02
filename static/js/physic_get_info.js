document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");

    select.addEventListener("change", function () {
        const selectedPlayer = playersData.find(player => player.fullName === select.value);
        if (!selectedPlayer) return; // Sécurité si le joueur n'existe pas
    
        const player_id = selectedPlayer.pid;
        
        // Définition des dates
        const today = new Date(2025, 2, 13);  // 13/03/2025 (Mois - 1 car JS commence à 0)
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);

        const prev30Days = new Date(last30Days);
        prev30Days.setDate(last30Days.getDate() - 30);

        fetch("../static/csv/CFC Physical Capability Data_.csv")
            .then(response => response.text())
            .then(rawData => {
                // Convertir les données en tableau d'objets
                const lines = rawData.trim().split("\n");
                const header = lines[0].split(",");

                const data = lines.slice(1).map(line => {
                    const columns = line.split(",");
                    return {
                        date: parseDate(columns[0]),
                        quality: columns[3],
                        benchmarkPct: columns[4] ? parseFloat(columns[4]) : null,
                        pid: columns[5]
                    };
                }).filter(row => row.quality && !isNaN(row.benchmarkPct) && (row.pid == player_id));  // Garder les valeurs valides

                // Fonction pour regrouper par quality et calculer moyenne et max
                function getStatsForPeriod(startDate, endDate) {
                    const groupedData = {};

                    data.forEach(row => {
                        if (row.date >= startDate && row.date <= endDate) {
                            if (!groupedData[row.quality]) {
                                groupedData[row.quality] = [];
                            }
                            groupedData[row.quality].push(row.benchmarkPct);
                        }
                    });

                    // Calcul de la moyenne et du max
                    const stats = {};
                    Object.keys(groupedData).forEach(quality => {
                        const values = groupedData[quality];
                        stats[quality] = {
                            average: Math.round((values.reduce((sum, val) => sum + val, 0))*100 / values.length)/100,
                            max: Math.round((Math.max(...values))*100)/100
                        };
                    });

                    return stats;
                }

                // Récupérer les stats pour les deux périodes
                const statsLast30 = getStatsForPeriod(last30Days, today);
                const statsPrev30 = getStatsForPeriod(prev30Days, last30Days);

                // Injecter les stats dans la balise B-physical
                const physicalContainer = document.getElementById("B-physical");
                physicalContainer.innerHTML = `
                    <div id="C-movement">
                            <p>Agility</p>
                            <div id="D-phy-stats">
                                <div id="E-phy-text">
                                    <p>\n</p>
                                    <p>Last 30d</p>
                                    <p>Previous 30d</p> 
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}% (${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}% (${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}% (${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}% (${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}% (${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}% (${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                            </div>
                    </div>
                     <div id="C-movement">
                            <p>Agility</p>
                            <div id="D-phy-stats">
                                <div id="E-phy-text">
                                    <p>\n</p>
                                    <p>Last 30d</p>
                                    <p>Previous 30d</p> 
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                            </div>
                    </div>
                     <div id="C-movement">
                            <p>Agility</p>
                            <div id="D-phy-stats">
                                <div id="E-phy-text">
                                    <p>\n</p>
                                    <p>Last 30d</p>
                                    <p>Previous 30d</p> 
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                            </div>
                    </div>
                     <div id="C-movement">
                            <p>Agility</p>
                            <div id="D-phy-stats">
                                <div id="E-phy-text">
                                    <p>\n</p>
                                    <p>Last 30d</p>
                                    <p>Previous 30d</p> 
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                                <div id="E-quality">
                                    <p>Deceleration</p>
                                    <div id="F-phy-stats">
                                        <p>Avg:${statsLast30.deceleration.average}%(${statsLast30.deceleration.max}%)</p>
                                        <p>Avg:${statsPrev30.deceleration.average}%(${statsPrev30.deceleration.max}%)</p>
                                    </div>
                                </div>
                            </div>
                    </div>
                    `;
            });
    });
});

// Fonction pour parser les dates au format DD/MM/YYYY
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);  // Mois commence à 0 en JavaScript
}
