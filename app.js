// declare packages
//const yargs = require('yargs');
const axios = require('axios');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require("body-parser");
const path = require('path');
const port = process.env.port || 3000;

//start express & set directory paths
var app = express();
//hbs.registerPartials(__dirname+'/views/partials');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname + '/public')));

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//render page
app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: "Weather Application"
  });
});

//get location request data
app.post('/', (req, res) => {
  let location = req.body.location;
  let encodedAddress = encodeURIComponent(location);
  let geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

  //call Dark Sky API 
  axios.get(geocodeUrl).then((response) => {
    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('Unable to find that address.');
    }

    let lat = response.data.results[0].geometry.location.lat;
    let lng = response.data.results[0].geometry.location.lng;
    const apiKey = '5e37b9c3dae7a201ae898c00f026c6b2';
    let weatherUrl = `https://api.forecast.io/forecast/${apiKey}/${lat},${lng}`;
    console.log(response.data.results[0].formatted_address);
    return axios.get(weatherUrl);
  }).then((response) => {
    let temperature = response.data.currently.temperature;
    let apparentTemperature = response.data.currently.apparentTemperature;
    let icon = response.data.currently.icon;
    let humidity = response.data.currently.humidity;
    let windSpeed = response.data.currently.windSpeed;
    console.log(`temperature: ${temperature}. apparent temp: ${apparentTemperature}. icon: ${icon}. humidity: ${humidity}. windspeed: ${windSpeed}.`);
    res.json({ temperature, apparentTemperature, icon, humidity, windSpeed });
  }).catch((e) => {
    if (e.code === 'ENOTFOUND') {
      console.log('Unable to connect to API servers.');
    } else {
      console.log(e.message);
      res.json('null');
    }
  });
});

//listen on port
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});