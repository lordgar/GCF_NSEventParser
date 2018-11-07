'use strict';

var Push = require('pushover-notifications');
const USER = process.env.PUSHOVER_USER;
const TOKEN = process.env.PUSHOVER_TOKEN;

function handleGET (req, res) {
  // Do something with the GET request
  res.status(200).send('GCF_NSEventParser');
}

function handlePOST (req, res) {
	console.log("Incoming POST:");
	console.log(req.params);
    console.log(req.query);
    parseForPushover(req.params, req.query);
    res.status(200).send('NSEventParser');
}

function parseForPushover(inParams, inQuery) {
    var v1 = inQuery.Value1.trim();
    var v2 = inQuery.Value2.trim();
    var v3 = inQuery.Value3.trim();
    var eventTitle = v1 + ' (' + inQuery.Event + ')';
    var eventSound;
    var eventMessage = v2 + '\n' + v3;
    var eventPriority;
    var sendMessage;
    var p = new Push( {
        user: USER,
        token: TOKEN,
    });
    
    switch (inQuery.Event) {
        case 'ns-event':
            sendMessage = false;
            break;
        case 'ns-info':
            console.log(v1);
            switch(v1){
                case 'Profile Switch':
                {
                    console.log("matched Profile Switch");
                    eventPriority = 1;
                    eventSound = 'alien';
                }
                break;
                case 'CGM Error Code':
                {
                    console.log("matched CGM Error Code");
                    eventPriority = 1;
                    eventSound = 'alien';
                }
                break;
                default:
                    eventSound = 'pushover';
                    eventPriority = -1;
                    break;
            }
            sendMessage = true;
            break;
        case 'ns-warning':
            eventSound = 'gamelan';
            eventPriority = -1;
            sendMessage = true;
            break;
        case 'ns-urgent':
            eventSound = 'gamelan';
            eventPriority = 0;
            sendMessage = true;
            break;    
        default:
            eventSound = 'pushover';
            eventPriority = -2;
            sendMessage = true;
            break;
    }
      
    if(sendMessage){
      var msg = {
            message: eventMessage,	// required
            title: eventTitle,
            sound: eventSound,
            priority: eventPriority
          };
          console.log("Sending notification with priority = " + msg.priority); 
          p.send( msg, function( err, result ) {
            if ( err ) {
              throw err;
            }
           
            console.log( result );
          });    
    } 
    else {
        console.log('message not sent');
    }

}


exports.nsevent = (req, res) => {
  switch (req.method) {
    case 'GET':
      handleGET(req, res);
      break;
    case 'POST':
      handlePOST(req, res);
      break;
    default:
      res.status(500).send({ error: 'Something blew up!' });
      break;
  }
};
