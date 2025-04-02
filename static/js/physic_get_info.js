document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");

    select.addEventListener("change", function () {
        const selectedPlayer = playersData.find(player => player.fullName === select.value);
        if (!selectedPlayer) return; // Sécurité si le joueur n'existe pas
    
        const player_id = selectedPlayer.pid;
        console.log(player_id)
        
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
                        movement: columns[2],
                        quality: columns[3],
                        benchmarkPct: columns[4] ? parseFloat(columns[4]) : null,
                        pid: columns[5]
                    };
                }).filter(row => row.quality && !isNaN(row.benchmarkPct) && (row.pid == player_id));  // Garder les valeurs valides


                function getStatsForPeriod(startDate, endDate) {
                    const groupedData = {};
                    
                    // Étape 1 : Regroupement des données existantes
                    data.forEach(row => {
                        if (row.date >= startDate && row.date <= endDate) {
                            const key = `${row.movement.replace(/[-\s]/g, '')}_${row.quality.replace(/[-\s]/g, '')}`;
                            if (!groupedData[key]) {
                                groupedData[key] = [];
                            }
                            groupedData[key].push(row.benchmarkPct);
                        }
                    });
                
                    // Étape 2 : Créer un ensemble complet des clés uniques possibles
                    const allPossibleKeys = ['agility_acceleration','agility_deceleration','agility_rotate',
                        'jump_land','jump_preload','jump_takeoff',
                        'sprint_acceleration','sprint_maxvelocity',
                        'upperbody_grapple','upperbody_pull','upperbody_push'];
                    // Étape 3 : Assurer que toutes les clés possibles existent, même si elles manquent
                    const stats = {};
                
                    allPossibleKeys.forEach(key => {
                        const values = groupedData[key] || [];
                        
                        if (values.length > 0) {
                            stats[key] = {
                                average: Math.round((values.reduce((sum, val) => sum + val, 0)) * 100 / values.length) / 100,
                                max: Math.round((Math.max(...values)) * 100) / 100
                            };
                        } else {
                            stats[key] = {
                                average: null,
                                max: null
                            };
                        }
                    });
                
                    return stats;
                }
                


                // Récupérer les stats pour les deux périodes
                const statsLast30 = getStatsForPeriod(last30Days, today);
                const statsPrev30 = getStatsForPeriod(prev30Days, last30Days);

                // Injecter les stats dans la balise B-physical
                const physicalContainer = document.getElementById("B-physical");
                console.log(statsPrev30)
                console.log(statsPrev30)
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
                            <p>Acceleration</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.agility_acceleration.average}% (${statsLast30.agility_acceleration.max}%)</p>
                                <p>Avg:${statsPrev30.agility_acceleration.average}% (${statsPrev30.agility_acceleration.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>Deceleration</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.agility_deceleration.average}% (${statsLast30.agility_deceleration.max}%)</p>
                                <p>Avg:${statsPrev30.agility_deceleration.average}% (${statsPrev30.agility_deceleration.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>Rotate</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.agility_rotate.average}% (${statsLast30.agility_rotate.max}%)</p>
                                <p>Avg:${statsPrev30.agility_rotate.average}% (${statsPrev30.agility_rotate.max}%)</p>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div id="C-movement">
                    <p>Jump</p>
                    <div id="D-phy-stats">
                        <div id="E-phy-text">
                            <p>\n</p>
                            <p>Last 30d</p>
                            <p>Previous 30d</p> 
                        </div>
                        <div id="E-quality">
                            <p>Land</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.jump_land.average}%(${statsLast30.jump_land.max}%)</p>
                                <p>Avg:${statsPrev30.jump_land.average}%(${statsPrev30.jump_land.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>Pre-load</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.jump_preload.average}%(${statsLast30.jump_preload.max}%)</p>
                                <p>Avg:${statsPrev30.jump_preload.average}%(${statsPrev30.jump_preload.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>Take off</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.jump_takeoff.average}%(${statsLast30.jump_takeoff.max}%)</p>
                                <p>Avg:${statsPrev30.jump_takeoff.average}%(${statsPrev30.jump_takeoff.max}%)</p>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div id="C-movement">
                    <p>Sprint</p>
                    <div id="D-phy-stats">
                        <div id="E-phy-text">
                            <p>\n</p>
                            <p>Last 30d</p>
                            <p>Previous 30d</p> 
                        </div>
                        <div id="E-quality">
                            <p>Acceleration</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.sprint_acceleration.average}%(${statsLast30.sprint_acceleration.max}%)</p>
                                <p>Avg:${statsPrev30.sprint_acceleration.average}%(${statsPrev30.sprint_acceleration.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>Max velocity</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.sprint_maxvelocity.average}%(${statsLast30.sprint_maxvelocity.max}%)</p>
                                <p>Avg:${statsPrev30.sprint_maxvelocity.average}%(${statsPrev30.sprint_maxvelocity.max}%)</p>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div id="C-movement">
                    <p>Upper Body</p>
                    <div id="D-phy-stats">
                        <div id="E-phy-text">
                            <p>\n</p>
                            <p>Last 30d</p>
                            <p>Previous 30d</p> 
                        </div>
                        <div id="E-quality">
                            <p>Grapple</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.upperbody_grapple.average}%(${statsLast30.upperbody_grapple.max}%)</p>
                                <p>Avg:${statsPrev30.upperbody_grapple.average}%(${statsPrev30.upperbody_grapple.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>pull</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.upperbody_pull.average}%(${statsLast30.upperbody_pull.max}%)</p>
                                <p>Avg:${statsPrev30.upperbody_pull.average}%(${statsPrev30.upperbody_pull.max}%)</p>
                            </div>
                        </div>
                        <div id="E-quality">
                            <p>Push</p>
                            <div id="F-phy-stats">
                                <p>Avg:${statsLast30.upperbody_push.average}%(${statsLast30.upperbody_push.max}%)</p>
                                <p>Avg:${statsPrev30.upperbody_push.average}%(${statsPrev30.upperbody_push.max}%)</p>
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
