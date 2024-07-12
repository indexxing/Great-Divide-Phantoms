/*
    code for timestamp taken from Polytoria's website (https://polytoria.com/event/the-great-divide page specifically)
    slightly modified to not use jquery, and to have hover creator name effect
    work smarter not harder
*/

/*
im not sure why i made this a nested object, but i don't feel like changing it
- index 2024
*/
const HallOfFameData = {
    Emir: {
        id: 17064,
        message: "Emir has been a valuable asset to the phantoms in the later days of the war, he has been in game consistently and encouraging others to not give up hope despite the dire situation we see ourselves in. On top of all this, Emir is incredibly valuable in combat, often being high up on the round leader board racking in kills for our team. Emir always thinks ahead and about what effect a round will have on the overall standings of the war."
    },
    kep: {
        id: 13673,
        message: "Kep is one of the strongest combatants in the Phantoms and has been vital to our efforts. Kep has often maintained the top of the leader-board, and even with that the gap between him and those below have been huge, this just proves how much devotion and dedication he has towards the phantoms, and for this he deserves a spot in the hall of fame. I don't think we would be anywhere near where we are without the help of Kep and his amazing combat and dedication to earning points."
    },
    Everlast: {
        id: 14772,
        message: "I think at this point it's no surprise that Everlast has been important to the phantoms. He has been responsible for a huge amount of our points, and was the first person to get the phantom teapot, which is an amazing achievement. Everlast is amazing in combat, but excluding this he is also incredibly dedicated to the phantoms, proceeding to earn points even after getting the teapot and offering to join games when people are in need of assistance."
    },
    Index: {
        id: 2782,
        message: "When it comes to the hall of fame, it's not just about combat it's about contributing to the phantom effort, and Index is a prime example of someone who went above and beyond to help the phantoms making an entire website which allows you to see the size of the gap between the phantoms and the cobras, as well as other features. On top of this, Index is still being helpful in battle, while not currently on the leader-board, he still has over 25k points as well as having made this amazing website."
    }
}

document.addEventListener('DOMContentLoaded', function(){
    const updateChartInterval = 60 * 60 * 1000; // 60 minutes
    const updateOdometerInterval = 60 * 1000; // 60 seconds
    var targetTimestamp = 1719219600;

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
        const Members = (await (await fetch('https://polyproxy.xv7r8fhghd.workers.dev/divide')).json()).memberCount
        document.getElementById('memberCount').innerText = Members

        if (memberUpdate === 1){
            setInterval(() => {
                // Prevent fetching data when the tab is not visible
                if (!document.hidden) {
                    updateMemberCount()
                }
            }, 15 * 1000); // 15 seconds
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
    let sort = 'hour-no-dupe';

    const defaultData = {
        labels: [],
        datasets: [{
            label: 'Phantoms',
            data: [],
            borderColor: '#516fda',
            tension: 0.1,
            hidden: true
        }, {
            label: 'Cobras',
            data: [],
            borderColor: '#3fb068',
            tension: 0.1,
            hidden: true
        }, {
            label: 'Difference',
            data: [],
            borderColor: '#ffffff',
            tension: 0.1
        }]
    };

    const chart = new Chart(ctx, {
        type: 'line',
        data: defaultData,
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
        // Prevent fetching data when the tab is not visible
        if (!document.hidden) {
            fetch('https://stats.silly.mom/team_points?timesort=' + sort + '&limit=100')
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
    }

    const options = document.getElementById('sortOptions');

    options.addEventListener('change', function(){
        changeData(options.options[options.selectedIndex].value)
    })

    /*
    Array.from(options).forEach(option => {
        option.addEventListener('click', function() {
            changeData(button.getAttribute('data-sort'));
        });
    });
    */

    function updateButtonStyles(selectedSort) {
        buttons.forEach(button => {
            if (button.getAttribute('data-sort') === selectedSort) {
                button.classList.remove('btn-outline-info');
                button.classList.add('btn-info');
            } else {
                button.classList.add('btn-outline-info');
                button.classList.remove('btn-info');
            }
        });
    }

    //updateButtonStyles(sort);

    function changeData(sortType) {
        // check if the sort type is already selected
        if (sort === sortType) return

        sort = sortType;
        chart.data = defaultData;
        updateChart();

        // change button styles
        // if selected, btn-outline-info is removed and btn-info is added
        //updateButtonStyles(sortType);
    }

    const phantomOdometer = document.getElementById('phantomsOdometer');
    const cobrasOdometer = document.getElementById('cobrasOdometer');
    const gapOdometer = document.getElementById('diffOdometer');
    
    function updateOdometers() {
        // Prevent fetching data when the tab is not visible
        if (!document.hidden) {
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
    }

    updateChart();
    updateOdometers();
    //alignInterval();
    //updateCountdown();
    updateMemberCount();

    setInterval(updateChart, updateChartInterval);
    setInterval(updateOdometers, updateOdometerInterval);

    Array.from(document.getElementsByClassName('hall-of-fame')).forEach(enlistee => {
        enlistee.addEventListener('click', function(){
            const Username = enlistee.getElementsByClassName('userlink')[0].innerText.trim()
            const Data = Object.values(HallOfFameData)[Object.keys(HallOfFameData).indexOf(Username)]
            document.getElementById('hall-of-fame-avatar').src = enlistee.getElementsByTagName('img')[0].src.replace('.png', '-icon.png')
            document.getElementById('hall-of-fame-name').innerText = Username;
            document.getElementById('hall-of-fame-name').href = 'https://polytoria.com/u/' + Username;
            document.getElementById('hall-of-fame-desc').innerText = Data.message
            document.getElementById('hall-of-fame-avatar').alt = 'Hall of Fame - ' + Username;
            document.getElementById('hall-of-fame-modal').showModal()
        })
    })
})