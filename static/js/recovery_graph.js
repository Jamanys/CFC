document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("E-player-select");
    setTimeout(function (){
        recovery_get_info(select)
    }, 50);

    select.addEventListener("change", function () {
        recovery_get_info(select)
    });
});

function recovery_get_info(select){
    const selectedPlayer = playersData.find(player => player.fullName === select.value);
    if (!selectedPlayer) return;

    const player_id = selectedPlayer.pid;
    const today_day = new Date("2025-03-13");
    const tenDaysAgo = new Date(today_day);
    tenDaysAgo.setDate(today_day.getDate() - 20);

    fetch("../static/csv/CFC Recovery status Data.csv")
    .then(response => response.text())
    .then(data => {
        const lines = data.split("\n");
        const header = lines[0].split(",");

        const valueIndex = header.indexOf("value");
        const dateIndex = header.indexOf("sessionDate");
        const pidIndex = header.indexOf("pid");
        const metricIndex = header.indexOf("metric");

        if (valueIndex === -1 || dateIndex === -1 || pidIndex === -1 || metricIndex === -1) {
            console.error("Colonnes introuvables dans le fichier CSV.");
            return;
        }

        const filteredData = lines.slice(1).map(line => {
            const columns = line.split(",");
            const dateStr = columns[dateIndex];
            const pidRow = columns[pidIndex];
            const metric = columns[metricIndex];
            const value = parseFloat(columns[valueIndex]);

            if (!dateStr || !pidRow || !metric || isNaN(value)) return null;

            const date = parseDate(dateStr);
            if (date < tenDaysAgo || pidRow != player_id) return null;

            return { date, metric, value };
        }).filter(item => item !== null);

        // Regrouper les données par jour et par métrique
        const groupedData = {};
        filteredData.forEach(({ date, metric, value }) => {
            const dateStr = date.toISOString().split("T")[0];
            if (!groupedData[dateStr]) groupedData[dateStr] = {};
            groupedData[dateStr][metric] = value;
        });
        const labels = Object.keys(groupedData).sort();

        const emboss = fillMissingValues(labels, groupedData, "emboss_baseline_score");
        const subjective = fillMissingValues(labels, groupedData, "subjective_baseline_composite");
        const sleep = fillMissingValues(labels, groupedData, "sleep_baseline_composite");
        const bio = fillMissingValues(labels, groupedData, "bio_baseline_composite");

        let lastmsk = null;
        let lastmskL = null;
        let lastmskJ = null;
        const msk = labels.map(date => {
            if ((groupedData[date]["msk_load_tolerance_baseline_composite"] !== undefined)) {
                lastmskL = groupedData[date]["msk_load_tolerance_baseline_composite"];
            }
            if ((groupedData[date]["msk_joint_range_baseline_composite"] !== undefined)) {
                lastmskJ = groupedData[date]["msk_joint_range_baseline_composite"];
            }
            lastmsk = (lastmskL + lastmskJ) / 2 || null; // Mise à jour si une valeur existe
            return lastmsk; // Utilise la dernière valeur connue
        });

        // Mettre à jour le graphique
        updateChart(labels, emboss, subjective, msk, sleep, bio);
    });
};

// Fonction pour initialiser et mettre à jour le graphique
function updateChart(labels, emboss, subjective, msk, sleep, bio) {
const ctx = document.getElementById("E-recovery-chart").getContext("2d");

window.recoveryChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            { label: "Emboss", data: emboss, borderColor: "#FF6384", fill: false },
            { label: "Subjective", data: subjective, borderColor: "#36A2EB", fill: false },
            { label: "Muscles", data: msk, borderColor: "#FFCE56", fill: false },
            { label: "Sleep", data: sleep, borderColor: "#4BC0C0", fill: false },
            { label: "Bio", data: bio, borderColor: "#9966FF", fill: false }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "white" // légende blanche
                }
            },
            title: {
                color: "white"
            },
            tooltip: {
                bodyColor: "white",
                titleColor: "white"
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "white" // texte des ticks en blanc
                },
                title: {
                    display: true,
                    text: "Date",
                    color: "white" // titre axe x en blanc
                }
            },
            y: {
                ticks: {
                    color: "white"
                },
                title: {
                    display: true,
                    text: "Score",
                    color: "white"
                }
            }
        }
    }
});


}

// Fonction pour parser une date au format "dd/mm/yyyy"
function parseDate(dateStr) {
const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
return new Date(year, month - 1, day);
}

function fillMissingValues(labels, groupedData, metric) {
let lastValue = null;
return labels.map(date => {
    if (groupedData[date] && groupedData[date][metric] !== undefined) {
        lastValue = groupedData[date][metric]; // Mise à jour si une valeur existe
    }
    return lastValue; // Utilise la dernière valeur connue
});

}