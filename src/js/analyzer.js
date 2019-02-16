import readXlsxFile from 'read-excel-file'
import _ from 'lodash';
import slugify from 'slugify';
import * as moment from 'moment';

// use combine first row date numbers with sheets name and return a moment object
const getMomentObj = (day, sheet) => {
    let datestring = day + ', ' + sheet;
    return moment(datestring, 'D, MMM YY');
}

// create an async fn where the xml file will be processed
export default async function (timesheet){

    $('#stats').html('<img style="width:200px" src="dist/images/17xo.gif">');
    
    // load uploaded file
    // and try to normalize as much data as possible

    // set our stats container
    let stats = {
        totalTimePerProject: {},
        timelinePerProject: {},
        monthlyTotalTimePerProject: {},
        dates: [],
        months: [],
        notWorkedOn: [],
        workedOn: []
    };
    let currentMonth = moment().month();
    // sheets === { 1: 'Sheet1', 2: 'Sheet2' }
    let availableSheets = await readXlsxFile(timesheet, { getSheets: true });
    // start processing each xlsx sheet
    for (let key in availableSheets) {
        // store sheet
        let sheet = {
            key: key,
            name: availableSheets[key]
        }
        // store month:
        let m = sheet.name.replace(' ', '-20');
        if (moment(m, 'MMM-YYYY').isSameOrBefore(moment())){
            stats.months.push(m);
        }
        // get current sheet rows
        let rows = await readXlsxFile(timesheet, { sheet: sheet.key });
        let projectName = '', dates = [];
        for (let i = 0; i < rows.length; i++) {
            // iterate through rows
            let row = rows[i];
            for (let y = 0; y < row.length; y++) {
                // iterate through row cells
                let cell = row[y];
                if (i === 0 && y === 0) {
                    // this is the 0,0 which we will ignore.. (project column)
                } else if (i === 0 && y > 0) {
                    // dates
                    dates.push(cell);
                    let d = getMomentObj(cell, sheet.name)
                    if (d.isSameOrBefore(moment())) {
                        stats.dates.push(d.format('YYYY-MM-DD'));
                    }
                } else if (i > 0 && y === 0) {
                    // set project name
                    // temporary store name as key until the next one comes and replace it
                    projectName = slugify(String(cell));
                    if (!stats.totalTimePerProject.hasOwnProperty(projectName)) {
                        stats.totalTimePerProject[projectName] = 0;
                    }
                    if (!stats.timelinePerProject.hasOwnProperty(projectName)) {
                        stats.timelinePerProject[projectName] = [];
                    }
                    if (!stats.monthlyTotalTimePerProject.hasOwnProperty(projectName)) {
                        stats.monthlyTotalTimePerProject[projectName] = {};
                    }
                } else {
                    // store total time
                    stats.totalTimePerProject[projectName] += cell !== null ? cell : 0;
                    // store timeline data
                    stats.timelinePerProject[projectName].push({
                        time: cell !== null ? cell : 0,
                        date: getMomentObj(dates[y - 1], sheet.name).format('YYYY-MM-DD')
                    });
                    // store monthly time totals
                    let monthKey = sheet.name.replace(' ', '-20');
                    if (monthKey in stats.monthlyTotalTimePerProject[projectName] === false){
                        stats.monthlyTotalTimePerProject[projectName][monthKey] = 0; // set & initialize
                    }
                    stats.monthlyTotalTimePerProject[projectName][monthKey] += cell !== null ? cell : 0;
                }
            }
        }
    }

    // clean up projects which timesheet has no hour records & store
    for (let project in stats.totalTimePerProject) {
        if (parseFloat(stats.totalTimePerProject[project]) === 0) {
            delete stats.totalTimePerProject[project]
            delete stats.timelinePerProject[project]
            delete stats.monthlyTotalTimePerProject[project]
            stats.notWorkedOn.push(project)
        } else {
            stats.workedOn.push(project)
        }
    }

    // sort time totals desc
    stats.totalTimePerProject = _.fromPairs(_.sortBy(_.toPairs(stats.totalTimePerProject), 1).reverse());

    // normalize timeline data - fill in the blanks and match indexes of stats.dates with stats.timelinePerProject
    for (let project in stats.timelinePerProject) {
        let projectTimeData = stats.timelinePerProject[project];
        for ( let index in stats.dates){
            let d = stats.dates[index],
                s = _.find(projectTimeData, { date: d })
            if (s === 'undefined' || s === undefined){
                stats.timelinePerProject[project].push({
                    time: 0,
                    date: d
                });
            }
        }
    }
    // normalize monthly data - fill in the blanks and match indexes of stats.months with stats.monthlyTotalTimePerProject
    for (let project in stats.monthlyTotalTimePerProject) {
        let monthlyTimeData = stats.monthlyTotalTimePerProject[project];
        for (let index in stats.months) {
            let m = stats.months[index];
            if (!monthlyTimeData.hasOwnProperty(m)) {
                stats.monthlyTotalTimePerProject[project][m] = 0;
            }
        }
    }
    // sort monthly data based on date key
    for (let project in stats.monthlyTotalTimePerProject){
        let monthlyTimeData = stats.monthlyTotalTimePerProject[project],
            orderedData = {};
        Object.keys(monthlyTimeData).sort(function (a, b){
            return moment(a, 'MMM-Y').toDate() - moment(b, 'MMM-Y').toDate();
        }).forEach(function(key) {
            orderedData[key] = monthlyTimeData[key];
        })
        stats.monthlyTotalTimePerProject[project] = orderedData;
    }
    // sort timeline data based on date value
    for (let project in stats.timelinePerProject) {
        let projectTimeData = stats.timelinePerProject[project];
        projectTimeData.sort(function compare(a, b) {
            var dateA = new Date(a.date);
            var dateB = new Date(b.date);
            return dateA - dateB;
        });
        stats.timelinePerProject[project] = projectTimeData;
    }

    return Promise.resolve({ stats: stats });

}