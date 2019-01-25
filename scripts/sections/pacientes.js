// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()
  loadPatients();
  window.patientsIdsFromServer=[];


derivarPendientes(); // Levantar los derivaciones pendientes
//setTimeout (derivarPendientes(), 20000);
  $( "#refreshPacients" ).click(function() {
    patientsFromServer();
  });
  $( "#search-box" ).keyup(function() {
    filterSearchBox($(this).val().toLowerCase());
  });
  $( "#addPacients" ).click(function() {
    window.location = "pacienteAdd.html";
  });
});

function filterSearchBox(text){
  $("#pacients-container .panel").each(function( index ) {
    if($( this ).data( "search" ).toLowerCase().indexOf(text)>-1 || text.length<1){
      $( this ).show();
    }else{
      $( this ).hide();
    }
  });
}
function openPacientsInMap(){
  window.location='gps.html';
}
function loadPatients(){
  //alert('window.memory.lastSync = '+window.memory.lastSync)
  if(window.memory.lastSync!=null){// No es la primera vez
    console.log('loadPatients Url memoria = '+apiurl);
      parsePacientes(window.memory.patients);
    if(needsSync(window.memory.lastSync)){
      addPatientsFromServer(1);
    }
  }else{// si es la primera vez trae desde la pagina 1
    console.log('Url server = '+apiurl);
    addPatientsFromServer(1);
  }
}
function patientsFromServer(){
  $("#refreshPacients").button('loading');
  window.patientsIdsFromServer=[];
  addPatientsFromServer(1);
  //alert('patientsFromServer '+window.patientsIdsFromServer)
}
function addPatientsFromServer(page){
  console.log(' addPatientsFromServer Url '+apiurl)
  $("#pacients-container").append(addLoader());
  var jqxhr = $.ajax({
                  method: "GET",
                  url: apiurl+'api/patients?page='+page+'&pagesize=10',
                  headers: { 'Authorization': window.user.token }
                })
                .done(function(xhr) {
                  managePatientsServer(xhr);
                  parsePacientes(xhr.Patients);
                  testIfPendient();
                })
                .fail(function(xhr) {
                  generalErrors(xhr);
                  $("#refreshPacients").button('reset');
                }).always(function() {
                  $( "#pcloader" ).remove();
                });
                // Si falla: $("#refreshPacients").button('reset'); ?
}
// Me fijo de cargar todos del servidor
function managePatientsServer(xhr){
  // Actualizo el loader
  var flag;
    console.log(' managePatientsServer = Url '+apiurl)
  for(patient in xhr.Patients){
    window.patientsIdsFromServer.push(xhr.Patients[patient].id);
    //alert('managePatientsServer '+window.patientsIdsFromServer)
    flag=0;
    for(mpatient in window.memory.patients){
      if(xhr.Patients[patient].id==window.memory.patients[mpatient].id){// Si existe actualizo el paciente
        flag=1;
        window.memory.patients[mpatient].name=xhr.Patients[patient].name;
        window.memory.patients[mpatient].lastname=xhr.Patients[patient].lastname;
        window.memory.patients[mpatient].dir=xhr.Patients[patient].dir;
        window.memory.patients[mpatient].phone=xhr.Patients[patient].phone;
        window.memory.patients[mpatient].dni=xhr.Patients[patient].dni;
        window.memory.patients[mpatient].prestaciones=xhr.Patients[patient].prestaciones;
        window.memory.patients[mpatient].ultima_prestacion=xhr.Patients[patient].ultima_prestacion;
        window.memory.patients[mpatient].proxima_prestacion=xhr.Patients[patient].proxima_prestacion;
        window.memory.patients[mpatient].tipopaciente=xhr.Patients[patient].tipo_paciente;
        //window.memory.patients[mpatient].geo.latitud=xhr.Patients[patient].geo.latitud;// Para hacer pruebas
        //window.memory.patients[mpatient].geo.longitud=xhr.Patients[patient].geo.longitud;// Para hacer pruebas
        break;
      }
    }
    //console.log('Tipo paciente '+xhr.Patients[patient].id+'  '+xhr.Patients[patient].tipo_paciente);
    if(flag==0){//console.log('Creo el paciente '+xhr.Patients[patient].tipo_paciente);
      memory.patients.push({// Si no existe creo el paciente
      "id":xhr.Patients[patient].id,
      "name":xhr.Patients[patient].name,
      "lastname":xhr.Patients[patient].lastname,
      "dir":xhr.Patients[patient].dir,
      "phone":xhr.Patients[patient].phone,
      "dni":xhr.Patients[patient].dni,
      "prestaciones":xhr.Patients[patient].prestaciones,
      "tipopaciente":xhr.Patients[patient].tipo_paciente,
      //"ultima_prestacion":xhr.Patients[patient].ultima_prestacion,
      //"proxima_prestacion":xhr.Patients[patient].proxima_prestacion,
      //"geo":{"latitud":xhr.Patients[patient].geo.latitud,"longitud":xhr.Patients[patient].geo.longitud}, // Matias pruebas 20190110
      "geo":{"latitud":"-34.571307","longitud":"-58.449015"}, // Para hacer pruebas
      "Visitas":[],
      "lastSync":null
    })}
  }// Fin recorro los pacientes de la consulta
  if(xhr.Pagination.current_page>=xhr.Pagination.total_pages){
    // Fin recorrer usuarios
    $("#refreshPacients").button('reset');
    endLoadingPatients();
  }else{
    addPatientsFromServer(parseInt(xhr.Pagination.current_page+1));
  }
}
// Entorno visual
function parsePacientes(patients){
  console.log('parsePacientes');
  var template_panel_paciente_props;
  var paciente;
  for(patient in patients){
    paciente=patients[patient];
    //console.log('parsePacientes Paciente id = '+paciente.id+'  '+paciente.tipopaciente);
    if(paciente.tipopaciente == '2'){var tipopaciente = 'PENDIENTE';var deriveImage = 'images/img/libre.svg'}
                                    else
                                    {var tipopaciente = '';var deriveImage = 'images/img/curved.svg'}
    template_panel_paciente_props = {
    	'{PACIENTE_ID}': paciente.id,
      '{FIRST_NAME}': paciente.name,
    	'{LAST_NAME}': paciente.lastname,
      '{TIPO_PACIENTE}':tipopaciente,
      '{DIR}': paciente.dir,
    	'{PROFILE_IMAGE}': "images/img/old.svg",
      '{DERIVE_IMAGE}': deriveImage,
    	'{PRESTACIONES}': parsePrestacionesName(paciente.prestaciones)
    }
    if($("#paciente-"+paciente.id+"-").length == 0){// Si no existe lo agrega
      $("#pacients-container").append(parseTemplate(template_panel_paciente_props,TEMPLATE_PANEL_PACIENTE));
    }else{// Si existe lo remplasa
      $("#paciente-"+paciente.id+"-").replaceWith(parseTemplate(template_panel_paciente_props,TEMPLATE_PANEL_PACIENTE));
    }

  }

}

// Matias
function derivarPendientes(){
  //alert('derivarPendientes nuevo');
  const user = JSON.parse(getCookie("user"))
  //console.log('url = '+apiurl+'api/prestadores/derivaciones');
  //console.log('token = '+user.token);
  var jqxhr = $.ajax({
                  method: "GET",
                  url: apiurl+'api/prestadores/derivaciones',
                  headers: { 'Authorization': user.token}
                })
                .done(function(xhr) {
                  //console.log('Respuesta Derivaciones ==> '+JSON.stringify(xhr));
                  //console.log('Total derivaciones = '+xhr.total_items);
                    var derivations =  xhr.derivaciones;
                    var derivo;
                    for(derivation in derivations){
                      derivo = derivations[derivation];
                      //console.log('drivacion x = '+JSON.stringify(derivo));
                      if(derivo.tipo_derivacion == 'receptor'){ //emisor - receptor
                        bootbox.dialog({
                          size: "small",
                          title: 'Derivaciones',
                          message: '<p>Tiene Derivaciones pendientes de Aprobación</p><p>¿Desea ir a Aprobación de Derivaciones?</p>',
                            buttons: {
                              si:{
                                label: 'Si',
                                className: 'btn-success',
                                callback: function(){window.location="aceptarDerivar.html"}
                              },
                              no:{
                                label: 'No',
                                className: 'btn-warning',
                                callback: function(){}
                              }
                            }
                        })
                        break
                        //console.log('Vale x = '+derivo.derivacion_id);
                      }
                      //console.log('drivacion = '+derivo.prestador_id+'  '+derivo.derivacion_id+'  '+derivo.paciente_id);
                    }
                  var derivarName = JSON.stringify(xhr);
                  setCookie("derivarName", derivarName, 120);

                })
                .fail(function(xhr) {
                  toastr.info('No se pudo leer las derivaciones pendientes');
                  $("#refreshLoader").button('reset');
                })
}
function addLoader(){
  return '<div class="panel fade in panel-default" data-init-panel="true" style="background: gainsboro;" id="pcloader"><div class="panel-body"><div class="search-result-item"><p class="text-center"><strong><i class="fa fa-spinner fa-spin fa-4x"></i></strong></p>        </div>        <!-- /.search-result-item -->    </div>    <!-- /.panel-body --></div>';
}
var TEMPLATE_PANEL_PACIENTE = ''
+'<div class="panel fade in panel-default" data-search="{FIRST_NAME} {LAST_NAME} {DIR}" id="paciente-{PACIENTE_ID}-" data-init-panel="true">'
+'    <div class="panel-body">'
+'        <div class="search-result-item">'
+'            <div class="media mb-2x">'
+'                <div class="media-left">'
+'                    <a href="paciente.html?id={PACIENTE_ID}" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="{PROFILE_IMAGE}" alt="">'
+'                    </a>'
+'                </div>'
+'                <!-- /.media-left -->'
+'                <div class="media-body">'
+'                    <a href="paciente.html?id={PACIENTE_ID}" style="color: rgba(22,24,27,.87);"><p class="media-heading"><strong>{FIRST_NAME} {LAST_NAME} </strong>'
+'                        <br><small class="text-muted"><i class="fa fa-map-marker fa-fw"></i>{DIR}</small></a>'
+'                        <br><p style="color:#FF0000";><b>{TIPO_PACIENTE}</b></p>'
+'                <!-- /.media-body -->'
+'                </div>'
// Matias 20190116
+'               <div class="media-right">'
+'                    <a href="pacienteDerivar.html?id={PACIENTE_ID}" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="{DERIVE_IMAGE}" title="Derivar">'
+'                    </a>'
+'               </div>'
// -----------------------
+'            <p><strong>Prestaciones:</strong> {PRESTACIONES} </p>'
+'        </div>'
+'        <!-- /.search-result-item -->'
+'    </div>'
+'    <!-- /.panel-body -->'
+'</div>';
