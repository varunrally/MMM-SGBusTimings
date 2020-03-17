/*
  Node Helper module for MMM-SGBusTimings
*/

var NodeHelper = require("node_helper");
const request = require("request");
const moment = require("moment")

module.exports = NodeHelper.create({

    start: function () {
        console.log(this.name + " SG helper started ...");
        this.config = null
        this.pooler = []
        this.doneFirstPooling = false

    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "INIT") {
            this.config = payload
        }
        else if (notification == "START") {
            if (this.pooler.length == 0) {
                this.prepareScan()
            }
            this.startPooling()
        }
        else {
            console.log(this.name + " - Did not process event: " + notification);
        }
    },

    startPooling: function () {
        var interval = 1000
        if (this.pooler.length > 0) {
            var busServiceNo = this.pooler.shift()
            this.callAPI(this.config, busServiceNo, (noti, payload) => {
                this.sendSocketNotification(noti, payload)
            })
        } else {
            this.doneFirstPooling = true
            this.prepareScan()
        }

        var timer = setTimeout(() => {
            this.startPooling()
        }, interval)

    },
    calculateValue: function (num) {
        result = Math.floor(((Date.parse(num) - Date.now()) / (1000 * 60)))
        if (result < 2) {
            return "Arr"
        }
        else if (isNaN(result)) {
            return ""
        }
        else return result + " m"
    },

    callAPI: function (cfg, busServiceNo, callback) {
        const http = require('http');
        var optionsget = {
            headers: {
                'AccountKey': cfg.apiKey,
                'Accept': 'application/json'
            },
            hostname: 'datamall2.mytransport.sg',
            path: '/ltaodataservice/BusArrivalv2?BusStopCode=' + cfg.busStopCode + '&ServiceNo=' + busServiceNo,
            method: 'GET'
        };

        http.get(optionsget, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                var busInfo = JSON.parse(data)
                // console.log(busInfo["Services"][0].ServiceNo)
                // console.log(busInfo["Services"][0].NextBus.EstimatedArrival)
                var result = {
                    "busServiceNo": busInfo["Services"][0].ServiceNo,
                    "nextBus": this.calculateValue(busInfo["Services"][0].NextBus.EstimatedArrival),
                    "nextBus2": this.calculateValue(busInfo["Services"][0].NextBus2.EstimatedArrival),
                    "nextBus3": this.calculateValue(busInfo["Services"][0].NextBus3.EstimatedArrival),
                    "requestTime": moment().format(cfg.timeFormat)
                }
                // console.log("Received following response: " + result["busServiceNo"])
                // console.log(result["nextBus"])
                // console.log(result["requestTime"])
                callback('UPDATE', result)
                // console.log("================")


            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });

    },

    prepareScan: function () {

        for (i in this.config.busServiceNos) {
            var busServiceNo = this.config.busServiceNos[i]
            this.pooler.push(busServiceNo)
        }

    },
});

