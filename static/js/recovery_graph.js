let recoveryChart;
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
    tenDaysAgo.setDate(today_day.getDate() - 7);

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

        const groupedData = {};
        filteredData.forEach(({ date, metric, value }) => {
            const dateStr = `${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate() + 1).padStart(2, '0')}`;
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
            lastmsk = (lastmskL + lastmskJ) / 2 || null;
            return lastmsk;
        });

        updateChart(labels, emboss, subjective, msk, sleep, bio);
    });
};

function updateChart(labels, emboss, subjective, msk, sleep, bio) {
    const ctx = document.getElementById("F-recovery-chart").getContext("2d");

    if (recoveryChart) {
        recoveryChart.destroy();
    }

    recoveryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Emboss", data: emboss, borderColor: "#dba111", fill: "#FF6384",borderWidth:2,pointRadius: 1},
                { label: "Subjective", data: subjective, borderColor: "#d1d3d4", fill: '#36A2EB',borderWidth: 2,pointRadius: 1 },
                { label: "Muscles", data: msk, borderColor: "#034694", fill: "#FFCE56",borderWidth: 2,pointRadius: 1 },
                { label: "Sleep", data: sleep, borderColor: "#6a7ab5", fill: "#4BC0C0" ,borderWidth: 2,pointRadius: 1 },
                { label: "Bio", data: bio, borderColor: "#ee242c", fill: "#9966FF" ,borderWidth: 2,pointRadius: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        boxWidth: 2,
                        font: {
                            size: 12
                        }
                    },
                    position :'bottom',
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

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split("/").map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
    }

    function fillMissingValues(labels, groupedData, metric) {
    let lastValue = null;
    return labels.map(date => {
        if (groupedData[date] && groupedData[date][metric] !== undefined) {
            lastValue = groupedData[date][metric];
        }
        return lastValue;
    });
}