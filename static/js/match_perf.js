let statchart1;
let statchart2;
let statchart3;
document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");
    setTimeout(function (){
        match_get_graphs(select)
    }, 50);
    select.addEventListener("change", function () {
        match_get_graphs(select)
    })
});

// Fonction match_get_stats pour récupérer les 4 derniers matchs filtrés
function match_get_stats(select) {
    return new Promise((resolve, reject) => {
        const selectedPlayer = playersData.find(player => player.fullName === select.value);
        const player_id = selectedPlayer.pid;
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
                    const date = new Date(year, month, day);  // mois commence à 0 en JavaScript
                    return oppositionCode && date && (pidRow == player_id);
                });
    
                // Filtrer et trier les matchs avant la date limite
                const beforeDate = filteredLines.filter(line => {
                    const dateStr = line.split(",")[header.indexOf("date")];
                    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
                    const date = new Date(year, month, day);
                    return date < new Date("2025-04-13");
                })
                .sort((a, b) => {
                    const dateStrA = a.split(",")[header.indexOf("date")];
                    const [dayA, monthA, yearA] = dateStrA.split("/").map(num => parseInt(num, 10));
                    const dateA = new Date(yearA, monthA - 1, dayA);

                    const dateStrB = b.split(",")[header.indexOf("date")];
                    const [dayB, monthB, yearB] = dateStrB.split("/").map(num => parseInt(num, 10));
                    const dateB = new Date(yearB, monthB - 1, dayB);

                    return dateA - dateB;  // Trie du plus ancien au plus récent
                })
                .slice(-4);  // Récupérer les 4 derniers matchs avant la date limite
                resolve({ header, beforeDate }); // Renvoi des matchs filtrés pour les utiliser dans match_get_graphs
            })
            .catch(error => reject(error));  // Gestion des erreurs
    });
}

function match_get_graphs(select) {

    if (statchart1) {
        statchart1.destroy();
    }
    if (statchart2) {
        statchart2.destroy();
    }
    if (statchart3) {
        statchart3.destroy();
    }
    match_get_stats(select).then(({ header, beforeDate }) => {
        // Utilisation du header et des matchs filtrés (beforeDate)
        const sums = {
            distance: 0,
            distance_over_21: 0,
            distance_over_24: 0,
            distance_over_27: 0,
            accel_2_5: 0,
            accel_3_5: 0,
            accel_4_5: 0,
            hr: [0, 0, 0, 0, 0]
        };

        beforeDate.forEach(line => {
            const col = line.split(",");
            sums.distance += parseFloat(col[header.indexOf("distance")]) || 0;
            sums.distance_over_21 += parseFloat(col[header.indexOf("distance_over_21")])|| 0;
            sums.distance_over_24 += parseFloat(col[header.indexOf("distance_over_24")]) || 0;
            sums.distance_over_27 += parseFloat(col[header.indexOf("distance_over_27")]) || 0;

            sums.accel_2_5 += parseFloat(col[header.indexOf("accel_decel_over_2_5")]) || 0;
            sums.accel_3_5 += parseFloat(col[header.indexOf("accel_decel_over_3_5")]) || 0;
            sums.accel_4_5 += parseFloat(col[header.indexOf("accel_decel_over_4_5")]) || 0;

            for (let i = 1; i <= 5; i++) {
                const hms = col[header.indexOf(`hr_zone_${i}_hms`)];
            
                if (hms) {
                    // Choisir le séparateur en fonction du caractère utilisé dans la chaîne (":" ou ".")
                    const separator = hms.includes(":") ? ":" : ".";
                    const [h, m, s] = hms.split(separator).map(n => parseInt(n) || 0);  // Convertir en nombre (0 si invalide)
                    
                    // Calculer le temps en minutes (ajout des heures converties en minutes et des secondes converties en fraction de minute)
                    sums.hr[i - 1] += h * 60 + m + s / 60;
                }
            }
        });

        // Création des graphiques
        statchart1 = new Chart(document.getElementById("distanceChart"), {
            type: "bar",
            data: {
                labels: ["- 21km/h", ">21km/h", ">24km/h", " + 27km/h"],
                datasets: [{
                    label: "Distance (m)",
                    data: [sums.distance-( sums.distance_over_21+sums.distance_over_24+ sums.distance_over_27), sums.distance_over_21, sums.distance_over_24, sums.distance_over_27],
                    backgroundColor: ["#d4d7ea", "#a9b0d4", "#7e8abf", "#5067a9", "#034694"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: "Distances Covered by Speed",
                        color: "white" },
                        legend: {
                            display: false
                        }
                    },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "white"
                        },
                        title: {
                            display: true,
                            text: "Distance (m)",
                            color: "white"
                        }
                    },
                    x: {
                        ticks: {
                            color: "white",
                            font: {
                                size: 8, // Taille des ticks sur l'axe Y
                            }
                        },
                        title: {
                            display: true,
                            text: "Speed",
                            color: "white",
                            size : 8
                        }
                    }
                }}
        });

        statchart2 = new Chart(document.getElementById("accelChart"), {
            type: "bar",
            data: {
                labels: [">2.5m/s²", ">3.5m/s²", ">4.5m/s²"],
                datasets: [{
                    label: "Nombre d'accel/décel",
                    data: [sums.accel_2_5, sums.accel_3_5, sums.accel_4_5],
                    backgroundColor: ["#d4d7ea", "#7e8abf", "#034694"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    title: { 
                        display: true,
                        text: "Number of Accelerations/Decelerations",
                        color: "white"
                    },
                    legend: {
                        display: false
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "white"
                        },
                        title: {
                            display: true,
                            text: "Accel / Decel",
                            color: "white"
                        }
                    },
                    x: {
                        ticks: {
                            color: "white",
                            font: {
                                size: 8, // Taille des ticks sur l'axe Y
                            }
                        },
                        title: {
                            display: true,
                            text: "square metre per second",
                            color: "white",
                            size : 8
                        }
                    }
                }
            },
        });

        statchart3 = new Chart(document.getElementById("hrChart"), {
            type: "bar",
            data: {
                labels: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
                datasets: [{
                    label: "Temps (min)",
                    data: sums.hr,
                    backgroundColor: ["#d4d7ea", "#a9b0d4", "#7e8abf", "#5067a9", "#034694"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        color: "white",
                        text: "Time Spent in Heart Rate Zones"
                    },
                    legend: {
                        display: false
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "white"
                        },
                        title: {
                            display: true,
                            text: "Minutes",
                            color: "white"
                        }
                    },
                    x: {
                        ticks: {
                            color: "white",
                            font: {
                                size: 8, // Taille des ticks sur l'axe Y
                            }
                        },
                        title: {
                            display: true,
                            text: "Heart Rate Zone",
                            color: "white"
                        }
                    }
                }
            }
        });
    }).catch(error => console.error("Erreur lors du chargement des stats:", error));
}
