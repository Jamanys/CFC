document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");
    setTimeout(function (){
        thestufftodo(select)
    }, 50);

    select.addEventListener("change", function () {
    thestufftodo(select)
    });
});


function thestufftodo(select){
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
            physicalContainer.innerHTML = `
                <div id="C-movement">
                    <p>Agility</p>
                    <div id="D-phy-stats">
                        <canvas id="chart-Agility"></canvas>
                    </div>
                </div>

                <div id="C-movement">
                    <p>Jump</p>
                    <div id="D-phy-stats">
                        <canvas id="chart-Jump"></canvas>
                    </div>
                </div>

                <div id="C-movement">
                    <p>Speed</p>
                    <div id="D-phy-stats">
                        <canvas id="chart-Sprint"></canvas>
                    </div>
                </div>

                <div id="C-movement">
                    <p>UpperBody</p>
                    <div id="D-phy-stats">
                        <canvas id="chart-Upper-Body"></canvas>
                    </div>
                </div>
                `;
            renderGroupedCharts(statsLast30);
    });
};


// Fonction pour parser les dates au format DD/MM/YYYY
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);  // Mois commence à 0 en JavaScript
}

function renderGroupedCharts(statsLast30) {
    const movements = {
        "Agility": {
            categories: ["Acceleration", "Deceleration", "Rotate"],
            keys: ["agility_acceleration", "agility_deceleration", "agility_rotate"]
        },
        "Jump": {
            categories: ["Land", "Preload", "Takeoff"],
            keys: ["jump_land", "jump_preload", "jump_takeoff"]
        },
        "Sprint": {
            categories: ["Acceleration", "Velocity"],
            keys: ["sprint_acceleration", "sprint_maxvelocity"]
        },
        "Upper Body": {
            categories: ["Grapple", "Pull", "Push"],
            keys: ["upperbody_grapple", "upperbody_pull", "upperbody_push"]
        }
    };

    // Ajouter les graphiques dynamiquement
    const container = document.getElementById("B-physical");

    Object.entries(movements).forEach(([movement, { categories, keys }]) => {
        const canvasId = `chart-${movement.replace(" ", "-")}`;
        // Récupérer les valeurs
        const avgValues = keys.map(key => statsLast30[key]?.average || 0);
        const maxValues = keys.map(key => statsLast30[key]?.max || 0);
        // Dessiner le graphique
        const ctx = document.getElementById(canvasId).getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: categories,
                datasets: [
                    {
                        label: "Moyenne (%)",
                        data: avgValues,
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 2,
                    },
                    {
                        label: "Max (%)",
                        data: maxValues,
                        backgroundColor: "rgba(255, 99, 132, 0.6)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 2
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                elements: {
                    bar: {
                        borderWidth: 2,
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'white',
                            boxWidth: 10
                        }
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                            font: {
                                size: 10
                            },
                            beginAtZero: true
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                            font: {
                                size: 10
                            },
                            stepSize: 0.2,
                            beginAtZero: true
                        }
                    }
                }
            }
        });
    });
}
