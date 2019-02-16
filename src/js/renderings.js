window.Chart = require('chart.js');
window.colorGenerator = require('./colorGenerator');

export default (_data) => {

    const stats = _data.stats || {};
    const defaultFontColor = '#404040';

    // general stats
    if (stats.hasOwnProperty('workedOn') && stats.hasOwnProperty('notWorkedOn')) {
        let statsHtml = ''
        statsHtml += `<h4>Worked on ${_data.stats.workedOn.length} projects out of ${_data.stats.notWorkedOn.length}</h4>`
        statsHtml += `<p><b>Not worked on these projects:</b> <i>${_data.stats.notWorkedOn.join(', ')}</i></p>`
        $('#stats').html(statsHtml) // render stats
    }

    // generate a bar chart with monthly totals per project (dataset)
    if (stats.hasOwnProperty('monthlyTotalTimePerProject') && stats.hasOwnProperty('months')) {
        // labels = [], data = [], bgs = []
        let datasets = [],
            i = 0;
        for (let project in stats.monthlyTotalTimePerProject) {
            let c = colorGenerator.DarkColor();
            datasets[i] = {
                label: project,
                borderColor: c,
                backgroundColor: c,
                data: []
                // hidden: i > 0
            };
            for (let month in stats.monthlyTotalTimePerProject[project]) {
                datasets[i].data.push(stats.monthlyTotalTimePerProject[project][month])
            }
            i++;
        }
        $('h3.monthly-hours-chart-title').removeClass('hidden');
        let myBarChart = new Chart(document.getElementById("monthly-hours-chart"), {
            type: 'bar',
            data: {
                labels: stats.months,
                datasets: datasets
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            fontColor: defaultFontColor,
                            fontSize: 16
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: defaultFontColor,
                            fontSize: 16
                        }
                    }]
                },
                legend: {
                    display: true,
                    labels: {
                        fontColor: defaultFontColor,
                        fontSize: 18
                    }
                },
                responsive: true
            }
        });
    }
    
    // generate a horizontal bar chart with overall time totals
    if (stats.hasOwnProperty('totalTimePerProject')) {
        let labels = [], data = [], bgs = [];
        for (let k in stats.totalTimePerProject) {
            labels.push(String(k));
            data.push(parseInt(stats.totalTimePerProject[k]));
            bgs.push(colorGenerator.DarkColor());
        }
        $('h3.total-hours-chart-title').removeClass('hidden');
        let myBarChart = new Chart(document.getElementById("total-hours-chart"), {
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Hour(s) allocated',
                    data: data,
                    backgroundColor: bgs
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            fontColor: defaultFontColor,
                            fontSize: 16
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: defaultFontColor,
                            fontSize: 16
                        }
                    }]
                },
                legend: {
                    display: false,
                    labels: {
                        fontColor: defaultFontColor,
                        fontSize: 18
                    }
                },
                responsive: true
            }
        });
    }

    // generate a line chart with project timelines
    if (stats.hasOwnProperty('timelinePerProject') && stats.hasOwnProperty('dates')) {
        // labels = [], data = [], bgs = []
        let datasets = [],
            i = 0;
        for (let project in stats.timelinePerProject) {
            datasets[i] = {
                label: project,
                borderColor: colorGenerator.DarkColor(),
                fill: false,
                data: [],
                hidden: i > 5
            };
            for (let index in stats.timelinePerProject[project]){
                datasets[i].data.push(stats.timelinePerProject[project][index].time)
            }
            i++;
        }
        $('h3.timelines-chart-title').removeClass('hidden');
        let myLineChart = new Chart(document.getElementById("timelines-chart"), {
            type: 'line',
            data: {
                labels: stats.dates,
                datasets: datasets
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false,
                            fontColor: defaultFontColor,
                            fontSize: 16,
                            min: 0,
                            max: 8,
                            stepSize: 0.5
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: defaultFontColor,
                            fontSize: 16
                        }
                    }]
                },
                legend: {
                    labels: {
                        fontColor: defaultFontColor,
                        fontSize: 18
                    }
                },
                responsive: true
            }
        });
    }

}
