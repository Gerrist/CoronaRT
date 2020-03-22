let express = require('express');
let rp = require('request-promise');
let http = require('http');
let fs = require('fs');
let proj4 = require('proj4');
let WebSocketServer = require("ws").Server;
const Transform = require('rdnaptrans').Transform;
const Geographic = require('rdnaptrans').Geographic;
const Cartesian = require('rdnaptrans').Cartesian;



let app = express();
const server = http.createServer(app);

var wss = new WebSocketServer({server: server});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            let m = JSON.parse(message);
            console.log(m);
            if ('lat' in m) {
                m['RD-X'] = proj4("+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs", [m['lat'], m['lon']])[0];
            }
            if ('lon' in m) {
                m['RD-Y'] = proj4("+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs", [m['lat'], m['lon']])[1];
            }
            wss.clients.forEach(function each(client) {
                client.send(JSON.stringify(m));
            });
        } catch (e) {

        }

    });

});

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/lladder.json', (req, res) => {
    rp(decodeURI(req.query.url)).then(data => {
        data = JSON.parse(data);

        Object.keys(data.scheduledStopPoints).forEach(k => {
            let c = proj4('+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs')
                .inverse([data.scheduledStopPoints[k].x, data.scheduledStopPoints[k].y]);

            const texelRD = new Cartesian(data.scheduledStopPoints[k].x, data.scheduledStopPoints[k].y, 1.0000);
            const texelETRS = Transform.rdnap2etrs(texelRD);
            // console.log(texelETRS);

            data.scheduledStopPoints[k].lat = texelETRS.phi;
            data.scheduledStopPoints[k].lon = texelETRS.lambda;
        });

        data = JSON.stringify(data);
        res.send(data);
    });
});


server.listen(80, () => {
    console.log('Running ');
});