// ----------------------------------------------------//
// Se crean las instancias de las librerias a utilizar //
// ----------------------------------------------------//

var modbus = require('jsmodbus');
var httpClient = require('node-rest-client').Client;
var clientHttp = new httpClient();
//Asignar host, puerto y otros par ametros al cliente Modbus
var client = modbus.client.tcp.complete({
  'host': "192.168.20.23",
  'port': 502,
  'autoReconnect': true,
  'timeout': 60000,
  'logEnabled': true,
  'reconnectTimeout': 30000
}).connect();

var intId, timeStop = 40,
  flagONS1 = 0,
  flagONS2 = 0,
  flagONS3 = 0,
  flagONS4 = 0,
  flagONS5 = 0,
  flagONS6 = 0,
  flagONS7 = 0,
  flagONS8 = 0,
  flagONS9 = 0,
  flagONS10 = 0,
  flagONS11 = 0;
var Filler, ctFiller = 0,
  speedTempFiller = 0,
  secFiller = 0,
  stopCountFiller = 0,
  flagStopFiller = 0,
  flagPrintFiller = 0,
  speedFiller = 0,
  timeFiller = 0;
var actualFiller = 0,
  stateFiller = 0;
var JarCapSorter, ctJarCapSorter = 0,
  speedTempJarCapSorter = 0,
  secJarCapSorter = 0,
  stopCountJarCapSorter = 0,
  flagStopJarCapSorter = 0,
  flagPrintJarCapSorter = 0,
  speedJarCapSorter = 0,
  timeJarCapSorter = 0;
var actualJarCapSorter = 0,
  stateJarCapSorter = 0;
var Capper, ctCapper = 0,
  speedTempCapper = 0,
  secCapper = 0,
  stopCountCapper = 0,
  flagStopCapper = 0,
  flagPrintCapper = 0,
  speedCapper = 0,
  timeCapper = 0;
var actualCapper = 0,
  stateCapper = 0;
var LabellerUpAndDown, ctLabellerUpAndDown = 0,
  speedTempLabellerUpAndDown = 0,
  secLabellerUpAndDown = 0,
  stopCountLabellerUpAndDown = 0,
  flagStopLabellerUpAndDown = 0,
  flagPrintLabellerUpAndDown = 0,
  speedLabellerUpAndDown = 0,
  timeLabellerUpAndDown = 0;
var actualLabellerUpAndDown = 0,
  stateLabellerUpAndDown = 0;
var LabellerRound, ctLabellerRound = 0,
  speedTempLabellerRound = 0,
  secLabellerRound = 0,
  stopCountLabellerRound = 0,
  flagStopLabellerRound = 0,
  flagPrintLabellerRound = 0,
  speedLabellerRound = 0,
  timeLabellerRound = 0;
var actualLabellerRound = 0,
  stateLabellerRound = 0;
var Shrinkwrapper, ctShrinkwrapper = 0,
  speedTempShrinkwrapper = 0,
  secShrinkwrapper = 0,
  stopCountShrinkwrapper = 0,
  flagStopShrinkwrapper = 0,
  flagPrintShrinkwrapper = 0,
  speedShrinkwrapper = 0,
  timeShrinkwrapper = 0;
var actualShrinkwrapper = 0,
  stateShrinkwrapper = 0;
var Checkweigher, ctCheckweigher = 0,
  speedTempCheckweigher = 0,
  secCheckweigher = 0,
  stopCountCheckweigher = 0,
  flagStopCheckweigher = 0,
  flagPrintCheckweigher = 0,
  speedCheckweigher = 0,
  timeCheckweigher = 0;
var actualCheckweigher = 0,
  stateCheckweigher = 0;
var Paletizer, ctPaletizer = 0,
  speedTempPaletizer = 0,
  secPaletizer = 0,
  stopCountPaletizer = 0,
  flagStopPaletizer = 0,
  flagPrintPaletizer = 0,
  speedPaletizer = 0,
  timePaletizer = 0;
var actualPaletizer = 0,
  statePaletizer = 0;
var Barcode, secBarcode = 0;
var secEOL = 0,
  secPubNub = 5 * 60;
var publishConfig;
var files = fs.readdirSync("/home/oee/Pulse/BYD_L22_LOGS/"); //Leer documentos
var actualdate = Date.now(); //Fecha actual
var text2send = []; //Vector a enviar
var flagInfo2Send = 0;
var i = 0;

function idle() {
  i = 0;
  text2send = [];
  for (k = 0; k < files.length; k++) { //Verificar los archivos
    var stats = fs.statSync("/home/oee/Pulse/BYD_L22_LOGS/" + files[k]);
    var mtime = new Date(stats.mtime).getTime();
    if (mtime < (Date.now() - (8 * 60 * 1000)) && files[k].indexOf("serialbox") == -1) {
      flagInfo2Send = 1;
      text2send[i] = files[k];
      i++;
    }
  }
}
// registering remote methods
clientHttp.registerMethod("postMethod", "http://35.160.68.187:23000/heartbeatLine/Byd", "POST");


function senderData() {
  clientHttp.methods.postMethod(publishConfig, function(data, response) {
    // parsed response body as js object
    console.log(data.toString());
  });
}
// --------------------------------------------------------- //
//Función que realiza las instrucciones de lectura de datos  //
// --------------------------------------------------------- //
var DoRead = function() {
  if (secPubNub >= 60 * 5) {
    idle();
    secPubNub = 0;
    publishConfig = {
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        message: {
          line: "22",
          tt: Date.now(),
          machines: text2send
        }
      }
    };
    senderData();
  } else {
    secPubNub++;
  }
  client.readHoldingRegisters(0, 99).then(function(resp) {
    var statesFiller = switchData(resp.register[0], resp.register[1]),
      statesJarCapSorter = switchData(resp.register[2], resp.register[3]),
      statesCapper = switchData(resp.register[4], resp.register[5]),
      statesLabellerUpAndDown = switchData(resp.register[6], resp.register[7]),
      statesLabellerRound = switchData(resp.register[8], resp.register[9]),
      statesShrinkwrapper = switchData(resp.register[10], resp.register[11]),
      statesCheckweigher = switchData(resp.register[12], resp.register[13]),
      statesPaletizer = switchData(resp.register[14], resp.register[15]);
    //Filler -------------------------------------------------------------------------------------------------------------
    ctFiller = joinWord(resp.register[21], resp.register[20]);
    if (flagONS1 === 0) {
      speedTempFiller = ctFiller;
      flagONS1 = 1;
    }
    if (secFiller >= 60) {
      if (stopCountFiller === 0 || flagStopFiller == 1) {
        flagPrintFiller = 1;
        secFiller = 0;
        speedFiller = ctFiller - speedTempFiller;
        speedTempFiller = ctFiller;
      }
      if (flagStopFiller == 1) {
        timeFiller = Date.now();
      }
    }
    secFiller++;
    if (ctFiller > actualFiller) {
      stateFiller = 1; //RUN
      if (stopCountFiller >= timeStop) {
        speedFiller = 0;
        secFiller = 0;
      }
      timeFiller = Date.now();
      stopCountFiller = 0;
      flagStopFiller = 0;


    } else if (ctFiller == actualFiller) {
      if (stopCountFiller === 0) {
        timeFiller = Date.now();
      }
      stopCountFiller++;
      if (stopCountFiller >= timeStop) {
        stateFiller = 2; //STOP
        speedFiller = 0;
        if (flagStopFiller === 0) {
          flagPrintFiller = 1;
          secFiller = 0;
        }
        flagStopFiller = 1;
      }
    }
    if (stateFiller == 2) {
      speedTempFiller = ctFiller;
    }

    actualFiller = ctFiller;
    if (stateFiller == 2) {
      if (statesFiller[5] == 1) {
        stateFiller = 3; //Wait
      } else {
        if (statesFiller[4] == 1) {
          stateFiller = 4; //Block
        }
      }
    }
    Filler = {
      ST: stateFiller,
      CPQI: joinWord(resp.register[19], resp.register[18]),
      CPQO: joinWord(resp.register[21], resp.register[20]),
      //CPQR: joinWord(resp.register[61],resp.register[60]),
      SP: speedFiller
    };
    if (flagPrintFiller == 1) {
      for (var key in Filler) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_Filler_L22.log", "tt=" + timeFiller + ",var=" + key + ",val=" + Filler[key] + "\n");
      }
      flagPrintFiller = 0;
    }
    //Filler -------------------------------------------------------------------------------------------------------------
    //JarCapSorter -------------------------------------------------------------------------------------------------------------
    ctJarCapSorter = joinWord(resp.register[23], resp.register[22]);
    if (flagONS2 === 0) {
      speedTempJarCapSorter = ctJarCapSorter;
      flagONS2 = 1;
    }
    if (secJarCapSorter >= 60) {
      if (stopCountJarCapSorter === 0 || flagStopJarCapSorter == 1) {
        flagPrintJarCapSorter = 1;
        secJarCapSorter = 0;
        speedJarCapSorter = ctJarCapSorter - speedTempJarCapSorter;
        speedTempJarCapSorter = ctJarCapSorter;
      }
      if (flagStopJarCapSorter == 1) {
        timeJarCapSorter = Date.now();
      }
    }
    secJarCapSorter++;
    if (ctJarCapSorter > actualJarCapSorter) {
      stateJarCapSorter = 1; //RUN
      if (stopCountJarCapSorter >= timeStop) {
        speedJarCapSorter = 0;
        secJarCapSorter = 0;
      }
      timeJarCapSorter = Date.now();
      stopCountJarCapSorter = 0;
      flagStopJarCapSorter = 0;


    } else if (ctJarCapSorter == actualJarCapSorter) {
      if (stopCountJarCapSorter === 0) {
        timeJarCapSorter = Date.now();
      }
      stopCountJarCapSorter++;
      if (stopCountJarCapSorter >= timeStop) {
        stateJarCapSorter = 2; //STOP
        speedJarCapSorter = 0;
        if (flagStopJarCapSorter === 0) {
          flagPrintJarCapSorter = 1;
          secJarCapSorter = 0;
        }
        flagStopJarCapSorter = 1;
      }
    }
    if (stateJarCapSorter == 2) {
      speedTempJarCapSorter = ctJarCapSorter;
    }

    actualJarCapSorter = ctJarCapSorter;
    if (stateJarCapSorter == 2) {
      if (statesJarCapSorter[5] == 1) {
        stateJarCapSorter = 3; //Wait
      } else {
        if (statesJarCapSorter[4] == 1) {
          stateJarCapSorter = 4; //Block
        }
      }
    }
    JarCapSorter = {
      ST: stateJarCapSorter,
      CPQI: joinWord(resp.register[23], resp.register[22]),
      //CPQO: joinWord(resp.register[21],resp.register[20]),
      //CPQR: joinWord(resp.register[61],resp.register[60]),
      SP: speedJarCapSorter
    };
    if (flagPrintJarCapSorter == 1) {
      for (var key in JarCapSorter) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_JarCapSorter_L22.log", "tt=" + timeJarCapSorter + ",var=" + key + ",val=" + JarCapSorter[key] + "\n");
      }
      flagPrintJarCapSorter = 0;
    }
    //JarCapSorter -------------------------------------------------------------------------------------------------------------
    //Capper -------------------------------------------------------------------------------------------------------------
    ctCapper = joinWord(resp.register[27], resp.register[26]);
    if (flagONS3 === 0) {
      speedTempCapper = ctCapper;
      flagONS3 = 1;
    }
    if (secCapper >= 60) {
      if (stopCountCapper === 0 || flagStopCapper == 1) {
        flagPrintCapper = 1;
        secCapper = 0;
        speedCapper = ctCapper - speedTempCapper;
        speedTempCapper = ctCapper;
      }
      if (flagStopCapper == 1) {
        timeCapper = Date.now();
      }
    }
    secCapper++;
    if (ctCapper > actualCapper) {
      stateCapper = 1; //RUN
      if (stopCountCapper >= timeStop) {
        speedCapper = 0;
        secCapper = 0;
      }
      timeCapper = Date.now();
      stopCountCapper = 0;
      flagStopCapper = 0;


    } else if (ctCapper == actualCapper) {
      if (stopCountCapper === 0) {
        timeCapper = Date.now();
      }
      stopCountCapper++;
      if (stopCountCapper >= timeStop) {
        stateCapper = 2; //STOP
        speedCapper = 0;
        if (flagStopCapper === 0) {
          flagPrintCapper = 1;
          secCapper = 0;
        }
        flagStopCapper = 1;
      }
    }
    if (stateCapper == 2) {
      speedTempCapper = ctCapper;
    }

    actualCapper = ctCapper;
    if (stateCapper == 2) {
      if (statesCapper[5] == 1) {
        stateCapper = 3; //Wait
      } else {
        if (statesCapper[4] == 1) {
          stateCapper = 4; //Block
        }
      }
    }
    Capper = {
      ST: stateCapper,
      CPQI: joinWord(resp.register[25], resp.register[24]),
      CPQO: joinWord(resp.register[27], resp.register[26]),
      //CPQR: joinWord(resp.register[61],resp.register[60]),
      SP: speedCapper
    };
    if (flagPrintCapper == 1) {
      for (var key in Capper) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_Capper_L22.log", "tt=" + timeCapper + ",var=" + key + ",val=" + Capper[key] + "\n");
      }
      flagPrintCapper = 0;
    }
    //Capper -------------------------------------------------------------------------------------------------------------
    //LabellerUpAndDown -------------------------------------------------------------------------------------------------------------
    ctLabellerUpAndDown = joinWord(resp.register[29], resp.register[28]);
    if (flagONS4 === 0) {
      speedTempLabellerUpAndDown = ctLabellerUpAndDown;
      flagONS4 = 1;
    }
    if (secLabellerUpAndDown >= 60) {
      if (stopCountLabellerUpAndDown === 0 || flagStopLabellerUpAndDown == 1) {
        flagPrintLabellerUpAndDown = 1;
        secLabellerUpAndDown = 0;
        speedLabellerUpAndDown = ctLabellerUpAndDown - speedTempLabellerUpAndDown;
        speedTempLabellerUpAndDown = ctLabellerUpAndDown;
      }
      if (flagStopLabellerUpAndDown == 1) {
        timeLabellerUpAndDown = Date.now();
      }
    }
    secLabellerUpAndDown++;
    if (ctLabellerUpAndDown > actualLabellerUpAndDown) {
      stateLabellerUpAndDown = 1; //RUN
      if (stopCountLabellerUpAndDown >= timeStop) {
        speedLabellerUpAndDown = 0;
        secLabellerUpAndDown = 0;
      }
      timeLabellerUpAndDown = Date.now();
      stopCountLabellerUpAndDown = 0;
      flagStopLabellerUpAndDown = 0;


    } else if (ctLabellerUpAndDown == actualLabellerUpAndDown) {
      if (stopCountLabellerUpAndDown === 0) {
        timeLabellerUpAndDown = Date.now();
      }
      stopCountLabellerUpAndDown++;
      if (stopCountLabellerUpAndDown >= timeStop) {
        stateLabellerUpAndDown = 2; //STOP
        speedLabellerUpAndDown = 0;
        if (flagStopLabellerUpAndDown === 0) {
          flagPrintLabellerUpAndDown = 1;
          secLabellerUpAndDown = 0;
        }
        flagStopLabellerUpAndDown = 1;
      }
    }
    if (stateLabellerUpAndDown == 2) {
      speedTempLabellerUpAndDown = ctLabellerUpAndDown;
    }

    actualLabellerUpAndDown = ctLabellerUpAndDown;
    if (stateLabellerUpAndDown == 2) {
      if (statesLabellerUpAndDown[5] == 1) {
        stateLabellerUpAndDown = 3; //Wait
      } else {
        if (statesLabellerUpAndDown[4] == 1) {
          stateLabellerUpAndDown = 4; //Block
        }
      }
    }
    LabellerUpAndDown = {
      ST: stateLabellerUpAndDown,
      CPQI: joinWord(resp.register[29], resp.register[28]),
      //CPQO: joinWord(resp.register[27],resp.register[26]),
      //CPQR: joinWord(resp.register[61],resp.register[60]),
      SP: speedLabellerUpAndDown
    };
    if (flagPrintLabellerUpAndDown == 1) {
      for (var key in LabellerUpAndDown) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_LabellerUpAndDown_L22.log", "tt=" + timeLabellerUpAndDown + ",var=" + key + ",val=" + LabellerUpAndDown[key] + "\n");
      }
      flagPrintLabellerUpAndDown = 0;
    }
    //LabellerUpAndDown -------------------------------------------------------------------------------------------------------------
    //LabellerRound -------------------------------------------------------------------------------------------------------------
    ctLabellerRound = joinWord(resp.register[31], resp.register[30]);
    if (flagONS5 === 0) {
      speedTempLabellerRound = ctLabellerRound;
      flagONS5 = 1;
    }
    if (secLabellerRound >= 60) {
      if (stopCountLabellerRound === 0 || flagStopLabellerRound == 1) {
        flagPrintLabellerRound = 1;
        secLabellerRound = 0;
        speedLabellerRound = ctLabellerRound - speedTempLabellerRound;
        speedTempLabellerRound = ctLabellerRound;
      }
      if (flagStopLabellerRound == 1) {
        timeLabellerRound = Date.now();
      }
    }
    secLabellerRound++;
    if (ctLabellerRound > actualLabellerRound) {
      stateLabellerRound = 1; //RUN
      if (stopCountLabellerRound >= timeStop) {
        speedLabellerRound = 0;
        secLabellerRound = 0;
      }
      timeLabellerRound = Date.now();
      stopCountLabellerRound = 0;
      flagStopLabellerRound = 0;


    } else if (ctLabellerRound == actualLabellerRound) {
      if (stopCountLabellerRound === 0) {
        timeLabellerRound = Date.now();
      }
      stopCountLabellerRound++;
      if (stopCountLabellerRound >= timeStop) {
        stateLabellerRound = 2; //STOP
        speedLabellerRound = 0;
        if (flagStopLabellerRound === 0) {
          flagPrintLabellerRound = 1;
          secLabellerRound = 0;
        }
        flagStopLabellerRound = 1;
      }
    }
    if (stateLabellerRound == 2) {
      speedTempLabellerRound = ctLabellerRound;
    }

    actualLabellerRound = ctLabellerRound;
    if (stateLabellerRound == 2) {
      if (statesLabellerRound[5] == 1) {
        stateLabellerRound = 3; //Wait
      } else {
        if (statesLabellerRound[4] == 1) {
          stateLabellerRound = 4; //Block
        }
      }
    }
    LabellerRound = {
      ST: stateLabellerRound,
      //CPQI: joinWord(resp.register[29],resp.register[28]),
      CPQO: joinWord(resp.register[31], resp.register[30]),
      //CPQR: joinWord(resp.register[61],resp.register[60]),
      SP: speedLabellerRound
    };
    if (flagPrintLabellerRound == 1) {
      for (var key in LabellerRound) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_LabellerRound_L22.log", "tt=" + timeLabellerRound + ",var=" + key + ",val=" + LabellerRound[key] + "\n");
      }
      flagPrintLabellerRound = 0;
    }
    //LabellerRound -------------------------------------------------------------------------------------------------------------
    //Shrinkwrapper -------------------------------------------------------------------------------------------------------------
    ctShrinkwrapper = joinWord(resp.register[35], resp.register[34]);
    if (flagONS6 === 0) {
      speedTempShrinkwrapper = ctShrinkwrapper;
      flagONS6 = 1;
    }
    if (secShrinkwrapper >= 60) {
      if (stopCountShrinkwrapper === 0 || flagStopShrinkwrapper == 1) {
        flagPrintShrinkwrapper = 1;
        secShrinkwrapper = 0;
        speedShrinkwrapper = ctShrinkwrapper - speedTempShrinkwrapper;
        speedTempShrinkwrapper = ctShrinkwrapper;
      }
      if (flagStopShrinkwrapper == 1) {
        timeShrinkwrapper = Date.now();
      }
    }
    secShrinkwrapper++;
    if (ctShrinkwrapper > actualShrinkwrapper) {
      stateShrinkwrapper = 1; //RUN
      if (stopCountShrinkwrapper >= timeStop) {
        speedShrinkwrapper = 0;
        secShrinkwrapper = 0;
      }
      timeShrinkwrapper = Date.now();
      stopCountShrinkwrapper = 0;
      flagStopShrinkwrapper = 0;


    } else if (ctShrinkwrapper == actualShrinkwrapper) {
      if (stopCountShrinkwrapper === 0) {
        timeShrinkwrapper = Date.now();
      }
      stopCountShrinkwrapper++;
      if (stopCountShrinkwrapper >= timeStop) {
        stateShrinkwrapper = 2; //STOP
        speedShrinkwrapper = 0;
        if (flagStopShrinkwrapper === 0) {
          flagPrintShrinkwrapper = 1;
          secShrinkwrapper = 0;
        }
        flagStopShrinkwrapper = 1;
      }
    }
    if (stateShrinkwrapper == 2) {
      speedTempShrinkwrapper = ctShrinkwrapper;
    }

    actualShrinkwrapper = ctShrinkwrapper;
    if (stateShrinkwrapper == 2) {
      if (statesShrinkwrapper[5] == 1) {
        stateShrinkwrapper = 3; //Wait
      } else {
        if (statesShrinkwrapper[4] == 1) {
          stateShrinkwrapper = 4; //Block
        }
      }
    }
    Shrinkwrapper = {
      ST: stateShrinkwrapper,
      CPQI: joinWord(resp.register[33], resp.register[32]),
      CPQO: joinWord(resp.register[35], resp.register[34]),
      //CPQR: joinWord(resp.register[61],resp.register[60]),
      SP: speedShrinkwrapper
    };
    if (flagPrintShrinkwrapper == 1) {
      for (var key in Shrinkwrapper) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_Shrinkwrapper_L22.log", "tt=" + timeShrinkwrapper + ",var=" + key + ",val=" + Shrinkwrapper[key] + "\n");
      }
      flagPrintShrinkwrapper = 0;
    }
    //Shrinkwrapper -------------------------------------------------------------------------------------------------------------
    //Checkweigher -------------------------------------------------------------------------------------------------------------
    ctCheckweigher = joinWord(resp.register[39], resp.register[38]);
    if (flagONS7 === 0) {
      speedTempCheckweigher = ctCheckweigher;
      flagONS7 = 1;
    }
    if (secCheckweigher >= 60) {
      if (stopCountCheckweigher === 0 || flagStopCheckweigher == 1) {
        flagPrintCheckweigher = 1;
        secCheckweigher = 0;
        speedCheckweigher = ctCheckweigher - speedTempCheckweigher;
        speedTempCheckweigher = ctCheckweigher;
      }
      if (flagStopCheckweigher == 1) {
        timeCheckweigher = Date.now();
      }
    }
    secCheckweigher++;
    if (ctCheckweigher > actualCheckweigher) {
      stateCheckweigher = 1; //RUN
      if (stopCountCheckweigher >= timeStop) {
        speedCheckweigher = 0;
        secCheckweigher = 0;
      }
      timeCheckweigher = Date.now();
      stopCountCheckweigher = 0;
      flagStopCheckweigher = 0;


    } else if (ctCheckweigher == actualCheckweigher) {
      if (stopCountCheckweigher === 0) {
        timeCheckweigher = Date.now();
      }
      stopCountCheckweigher++;
      if (stopCountCheckweigher >= timeStop) {
        stateCheckweigher = 2; //STOP
        speedCheckweigher = 0;
        if (flagStopCheckweigher === 0) {
          flagPrintCheckweigher = 1;
          secCheckweigher = 0;
        }
        flagStopCheckweigher = 1;
      }
    }
    if (stateCheckweigher == 2) {
      speedTempCheckweigher = ctCheckweigher;
    }

    actualCheckweigher = ctCheckweigher;
    if (stateCheckweigher == 2) {
      if (statesCheckweigher[5] == 1) {
        stateCheckweigher = 3; //Wait
      } else {
        if (statesCheckweigher[4] == 1) {
          stateCheckweigher = 4; //Block
        }
      }
    }
    Checkweigher = {
      ST: stateCheckweigher,
      CPQI: joinWord(resp.register[37], resp.register[36]),
      CPQO: joinWord(resp.register[39], resp.register[38]),
      CPQR: joinWord(resp.register[41], resp.register[40]),
      SP: speedCheckweigher
    };
    if (flagPrintCheckweigher == 1) {
      for (var key in Checkweigher) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_Checkweigher_L22.log", "tt=" + timeCheckweigher + ",var=" + key + ",val=" + Checkweigher[key] + "\n");
      }
      flagPrintCheckweigher = 0;
    }
    //Checkweigher -------------------------------------------------------------------------------------------------------------
    //Paletizer -------------------------------------------------------------------------------------------------------------
    ctPaletizer = joinWord(resp.register[43], resp.register[42]);
    if (flagONS8 === 0) {
      speedTempPaletizer = ctPaletizer;
      flagONS8 = 1;
    }
    if (secPaletizer >= 60) {
      if (stopCountPaletizer === 0 || flagStopPaletizer == 1) {
        flagPrintPaletizer = 1;
        secPaletizer = 0;
        speedPaletizer = ctPaletizer - speedTempPaletizer;
        speedTempPaletizer = ctPaletizer;
      }
      if (flagStopPaletizer == 1) {
        timePaletizer = Date.now();
      }
    }
    secPaletizer++;
    if (ctPaletizer > actualPaletizer) {
      statePaletizer = 1; //RUN
      if (stopCountPaletizer >= timeStop) {
        speedPaletizer = 0;
        secPaletizer = 0;
      }
      timePaletizer = Date.now();
      stopCountPaletizer = 0;
      flagStopPaletizer = 0;


    } else if (ctPaletizer == actualPaletizer) {
      if (stopCountPaletizer === 0) {
        timePaletizer = Date.now();
      }
      stopCountPaletizer++;
      if (stopCountPaletizer >= timeStop) {
        statePaletizer = 2; //STOP
        speedPaletizer = 0;
        if (flagStopPaletizer === 0) {
          flagPrintPaletizer = 1;
          secPaletizer = 0;
        }
        flagStopPaletizer = 1;
      }
    }
    if (statePaletizer == 2) {
      speedTempPaletizer = ctPaletizer;
    }

    actualPaletizer = ctPaletizer;
    if (statePaletizer == 2) {
      if (statesPaletizer[5] == 1) {
        statePaletizer = 3; //Wait
      } else {
        if (statesPaletizer[4] == 1) {
          statePaletizer = 4; //Block
        }
      }
    }
    Paletizer = {
      ST: statePaletizer,
      CPQI: joinWord(resp.register[43], resp.register[42]),
      //CPQO: joinWord(resp.register[39],resp.register[38]),
      //CPQR: joinWord(resp.register[41],resp.register[40]),
      SP: speedPaletizer
    };
    if (flagPrintPaletizer == 1) {
      for (var key in Paletizer) {
        fs.appendFileSync("/home/oee/Pulse/BYD_L22_LOGS/pol_byd_Paletizer_L22.log", "tt=" + timePaletizer + ",var=" + key + ",val=" + Paletizer[key] + "\n");
      }
      flagPrintPaletizer = 0;
    }
    //Paletizer -------------------------------------------------------------------------------------------------------------
    //Barcode -------------------------------------------------------------------------------------------------------------
    if (resp.register[49] == 0 && resp.register[50] == 0 && resp.register[51] == 0 && resp.register[52] == 0 && resp.register[53] == 0 && resp.register[54] == 0 && resp.register[55] == 0) {
      Barcode = '0';
    } else {
      var dig1 = hex2a(assignment(resp.register[49]).toString(16));
      var dig2 = hex2a(assignment(resp.register[50]).toString(16));
      var dig3 = hex2a(assignment(resp.register[51]).toString(16));
      var dig4 = hex2a(assignment(resp.register[52]).toString(16));
      var dig5 = hex2a(assignment(resp.register[53]).toString(16));
      var dig6 = hex2a(assignment(resp.register[54]).toString(16));
      var dig7 = hex2a(assignment(resp.register[55]).toString(16));
      Barcode = dig1 + dig2 + dig3 + dig4 + dig5 + dig6 + dig7;
    }
    if (isNaN(Barcode)) {
      Barcode = '0';
    }
    if (secBarcode >= 60 && !isNaN(Barcode)) {
      writedataBarcode(Barcode, "pol_byd_Barcode_L22.log");
      secBarcode = 0;
    }
    secBarcode++;
    //Barcode -------------------------------------------------------------------------------------------------------------
    //EOL --------------------------------------------------------------------------------------------------------------------
    if (secEOL >= 60) {
      fs.appendFileSync("../BYD_L22_LOGS/pol_byd_EOL_L22.log", "tt=" + Date.now() + ",var=EOL" + ",val=" + Paletizer.CPQI + "\n");
      secEOL = 0;
    }
    secEOL++;
    //EOL --------------------------------------------------------------------------------------------------------------------
  }); //END Client Read
};

var assignment = function(val) {
  var result;
  if (val < 4095)
    result = "";
  else
    result = val;
  return result;
};

function hex2a(hex) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

var stateMachine = function(data) {
  if (data[7] == 1) {
    return 1; //RUN
  }
  if (data[6] == 1) {
    return 2; //STOP
  }
  if (data[5] == 1) {
    return 3; //WAIT
  }
  if (data[4] == 1) {
    return 4; //BLOCK
  }
  return 2;
};

var counterState = function(actual, temp) {
  if (actual != temp) {
    return 1;
  } else {
    return 2;
  }
};

var writedata = function(varJson, nameFile) {
  var data;
  var timet = Date.now();
  for (var key in varJson) {
    fs.appendFileSync("/home/pi/Pulse/BYD_L22_LOGS/" + nameFile, "tt=" + timet + ",var=" + key + ",val=" + varJson[key] + "\n");
  }
};

var writedataBarcode = function(barcode, nameFile) {
  var timet = Date.now();
  fs.appendFileSync("../BYD_L22_LOGS/" + nameFile, "tt=" + timet + ",var=bc" + ",val=" + barcode + "\n");
};

var joinWord = function(num1, num2) {
  var bits = "00000000000000000000000000000000";
  var bin1 = num1.toString(2),
    bin2 = num2.toString(2),
    newNum = bits.split("");

  for (var i = 0; i < bin1.length; i++) {
    newNum[31 - i] = bin1[(bin1.length - 1) - i];
  }
  for (var j = 0; j < bin2.length; j++) {
    newNum[15 - j] = bin2[(bin2.length - 1) - j];
  }
  bits = newNum.join("");
  return parseInt(bits, 2);
};
var switchData = function(num1, num2) {
  var bits = "00000000000000000000000000000000";
  var bin1 = num1.toString(2),
    bin2 = num2.toString(2),
    newNum = bits.split("");

  for (var i = 0; i < bin1.length; i++) {
    newNum[15 - i] = bin1[(bin1.length - 1) - i];
  }
  for (var j = 0; j < bin2.length; j++) {
    newNum[31 - j] = bin2[(bin2.length - 1) - j];
  }
  bits = newNum.join("");

  return bits;
};

var stop = function() {
  ///This function clean data
  clearInterval(intId);
  process.exit(0);
};

var shutdown = function() {
  ///Use function STOP and close connection
  stop();
  client.close();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


///*If client is connect call a function "DoRead"*/
client.on('connect', function(err) {
  setInterval(function() {
    DoRead();
  }, 1000);
});

///*If client is in a error ejecute an acction*/
client.on('error', function(err) {
  fs.appendFileSync("error.log", "ID 1: " + Date.now() + ": " + err + "\n");
  //console.log('Client Error', err);
});
///If client try closed, this metodo try reconnect client to server
client.on('close', function() {
  //console.log('Client closed, stopping interval.');
  fs.appendFileSync("error.log", "ID 2: " + Date.now() + ": " + 'Client closed, stopping interval.' + "\n");
  stop();
});
