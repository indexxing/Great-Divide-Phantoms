/*
    code for timestamp taken from Polytoria's website (https://polytoria.com/event/the-great-divide page specifically)
    slightly modified to not use jquery, and to have hover creator name effect
    work smarter not harder
*/

document.addEventListener('DOMContentLoaded', function(){
    const updateChartInterval = 60 * 30 * 1000; // 30 minutes
    const updateOdometerInterval = 60 * 1000; // 60 seconds
    var targetTimestamp = 1718960400;

    function updateCountdown() {
        var now = new Date().getTime();
        var targetTime = targetTimestamp * 1000;
        var diff = targetTime - now;

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        var countdownStr = "";
        if (days > 0) {
            if (hours > 0) {
                countdownStr += days + (days === 1 ? " day, " : " days, ");
                countdownStr += hours + (hours === 1 ? " hour, and " : " hours, and ");
                countdownStr += minutes + (minutes === 1 ? " minute" : " minutes");
            }
            else {
                if (minutes > 0) {
                    countdownStr += days + (days === 1 ? " day and " : " days and ");
                    countdownStr += minutes + (minutes === 1 ? " minute" : " minutes");
                }
                else {
                    countdownStr += days + (days === 1 ? " day" : " days");
                }
            }
        }
        else {
            if (hours > 0) {
                countdownStr += hours + (hours === 1 ? " hour, " : " hours, ");
                countdownStr += minutes + (minutes === 1 ? " minute, and " : " minutes, and ");
                countdownStr += seconds + (seconds === 1 ? " second" : " seconds");
            }
            else {
                if (minutes > 0) {
                    countdownStr += minutes + (minutes === 1 ? " minute and " : " minutes and ");
                    countdownStr += seconds + (seconds === 1 ? " second" : " seconds");
                }
                else {
                    if (seconds > 0) {
                        countdownStr += seconds + (seconds === 1 ? " second" : " seconds");
                    }
                    else {
                        countdownStr = "very soon";
                    }
                }
            }
            
        }

        document.getElementById('countdown').innerText = countdownStr;
    }

    let memberUpdate = 0
    async function updateMemberCount() {
        // I would subtract like 3 users because Polytoria, Jane, and Brixster are in the group but then people would tell me it's incorrect so im going to keep the data incorrect
        memberUpdate++
        const Members = (await (await fetch('https://polyproxy.xv7r8fhghd.workers.dev/divide')).json()).phantoms
        document.getElementById('memberCount').innerText = Members

        if (memberUpdate === 1){
            setInterval(() => {
                updateMemberCount()
            }, 15000);
        }
    }

    function alignInterval() {
        var now = new Date();
        var msToNextSecond = 1000 - (now.getMilliseconds());

        setTimeout(function() {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }, msToNextSecond);
    }

    const ctx = document.getElementById('divideChart');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Phantoms',
                data: [],
                borderColor: '#516fda',
                tension: 0.1
            }, {
                label: 'Cobras',
                data: [],
                borderColor: '#3fb068',
                tension: 0.1
            }, {
                label: 'Difference',
                data: [],
                borderColor: '#ffffff',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                },
                x: {
                    ticks: {
                        display: false
                    }
                }
            }
        }
    });

    function updateChart() {
        fetch('https://stats.silly.mom/team_points?timesort=hour')
            .then(response => response.json())
            .then(data => {
                // first, sort data by timestamp
                data.results.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                // map data to chart
                chart.data.labels = data.results.map(result => result.timestamp);
                chart.data.datasets[0].data = data.results.map(result => result.phantoms);
                chart.data.datasets[1].data = data.results.map(result => result.cobras);
                chart.data.datasets[2].data = data.results.map(result => Math.abs(result.phantoms - result.cobras));

                chart.update();
            });
    }

    const phantomOdometer = document.getElementById('phantomsOdometer');
    const cobrasOdometer = document.getElementById('cobrasOdometer');
    const gapOdometer = document.getElementById('diffOdometer');
    

    function updateOdometers() {
        fetch('https://stats.silly.mom/team_points?limit=1')
            .then(response => response.json())
            .then(data => {
                const result = data.results[0];

                phantomOdometer.innerText = result.phantoms;
                cobrasOdometer.innerText = result.cobras;
                // gap between phantoms and cobras
                gapOdometer.innerText = Math.abs(result.phantoms - result.cobras);
            });
    }

    updateChart();
    updateOdometers();
    alignInterval();
    updateCountdown();
    updateMemberCount();

    setInterval(updateChart, updateChartInterval);
    setInterval(updateOdometers, updateOdometerInterval);
})