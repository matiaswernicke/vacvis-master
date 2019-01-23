
// Esto es para hacer un render en un Mapa
/*BackgroundGeolocation.getLocations(
  function (locations) {
    console.log(locations);
  }
); */
document.addEventListener('deviceready', onDeviceReadyGps, false);
function onDeviceReadyGps() {
  //alert('comienza mambo GPS');
  BackgroundGeolocation.configure({
    debug: true,
    desiredAccuracy:'HIGH_ACCURACY',
    maxLocations:1// No me interesa mucho guardar las locations, por eso le pongo 1
  });
  //checkStatusGPS();
  BackgroundGeolocation.start();
  setTimeout(function(){ getLocationGps(); }, 2000);
}
function getLocationGps(){
  BackgroundGeolocation.checkStatus(checkStatusSuccess, checkStatusFail);
}
// Como me da el status [{"isRunning":true/false, 'time':nro,"latitude":-34.4191274,"longitude":-58.81449651,"accuracy":10.618999481201172}]
function checkStatusSuccess(response){
  if(response.isRunning){
    BackgroundGeolocation.getLocations(getLocationsSuccess, getLocationsFail);
  }
  else{// Apagado
    setTimeout(function(){
      BackgroundGeolocation.start();
      getLocationGps();
    }, 1000);
  }
}
function checkStatusFail(response){
  toastr.error('Fallo el GPS');
  getLocationGps();
}
// start()
function getLocationsSuccess(response){
  if(response.length>0){
    window.gpslocation=response[0];
    BackgroundGeolocation.stop();
  }else{
    setTimeout(function(){
      BackgroundGeolocation.getLocations(getLocationsSuccess, getLocationsFail);
    }, 500);
  }
}
// Como me da las locations window.location= [{provider:'gps', 'time':nro,"latitude":-34.4191274,"longitude":-58.81449651,"accuracy":10.618999481201172}]
function getLocationsFail(response){
  toastr.error('Fallo el GPS');
  getLocationGps();
}
// stop()
// getLocations(success, fail)
// Distance between two points ,
//alert("Test: "+getDistanceFromLatLonInMt(-34.4191274,-58.81449651,-34.418242,-58.815308))
function getDistanceFromLatLonInMts(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  var d = Math.round(d * 1000); // Distance in Meters in straight line
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
