const header = ["busServiceNo", "nextBus", "nextBus2", "nextBus3"]
const headerTitle = ["Bus Service No", "Next Bus 1", "Next Bus 2", "Next Bus 3"]

Module.register("MMM-SGBusTimings", {
  defaults: {
    apiKey: "",
    busServiceNos: ["21", "59"],
    busStopCode: "84639",
    timeFormat: "DD-MM HH:mm",

  },
  getStyles: function () {
    return ["MMM-SGBusTimings.css"]
  },

  start: function () {
    this.sendSocketNotification("INIT", this.config)
    this.buses = {}
    this.isStarted = false    
  },

  getDom: function () {
    var wrapper = document.createElement("div")
    wrapper.id = "SGBUSTIMINGS"
    return wrapper
  },

  prepareTable: function () {
    var wrapper = document.getElementById("SGBUSTIMINGS")
    wrapper.innerHTML = ""

    var tbl = document.createElement("table")
    tbl.id = "SGBUSTIMINGS_TABLE"
    var thead = document.createElement("thead")
    var tr = document.createElement("tr")
    for (i in header) {
      var td = document.createElement("td")
      td.innerHTML = headerTitle[i]
      td.className = "busServiceNoHeader"
      tr.appendChild(td)
    }
    thead.appendChild(tr)
    tbl.appendChild(thead)

    for (i in this.config.busServiceNos) {
      var busNo = this.config.busServiceNos[i]
      var tr = document.createElement("tr")
      tr.className = "busService"
      tr.id = busNo
      for (j in header) {
        var td = document.createElement("td")
        td.innerHTML = (j != 0) ? "---" : busNo
        td.className = (j == 0) ? "busServiceNo" : "nextBus"
        td.id = busNo + "_" + header[j]
        tr.appendChild(td)
      }
      tbl.appendChild(tr)
    }    
    wrapper.appendChild(tbl)
    var tl = document.createElement("div")
    tl.className = "tagline"
    tl.id = "SGBUSES_TAGLINE"
    tl.innerHTML = "Last updated : "
    wrapper.appendChild(tl)    
  },

  drawTable: function (busInfo) {    
    var tr = document.getElementById(busInfo.busServiceNo)
    for (j = 1; j <= 3; j++) {            
      var tdId = header[j]
      var td = document.getElementById(busInfo['busServiceNo'] + "_" + tdId)
      
      busTime = busInfo[header[j]]
      if (td.innerHTML != busTime) {
        td.innerHTML = busTime
        if (busTime == "Arr") {
          td.className = "nextBusArr"
        }
        else {
          td.className = "nextBus"
        }
      }
    }
    var tl = document.getElementById("SGBUSES_TAGLINE")
    tl.innerHTML = "Last updated: " + busInfo["requestTime"]    
  },

  notificationReceived: function (noti, payload) {
    if (noti == "DOM_OBJECTS_CREATED") {
      this.sendSocketNotification("START")
      this.prepareTable()
    }    
  },


  socketNotificationReceived: function (noti, payload) {
    if (noti == "UPDATE") {
      this.drawTable(payload)
    }    
  },

});

