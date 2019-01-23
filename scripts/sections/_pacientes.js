// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()
  loadPatients();
  window.patientsIdsFromServer=[];
  //addPatientsFromServer(1);
  // refreshPacients
  $( "#refreshPacients" ).click(function() {
    patientsFromServer();
  });
  $( "#search-box" ).keyup(function() {
    filterSearchBox($(this).val().toLowerCase());
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
  if(window.memory.lastSync!=null){// No es la primera vez
      parsePacientes(window.memory.patients);
    if(needsSync(window.memory.lastSync)){
      addPatientsFromServer(1);
    }
  }else{// si es la primera vez trae desde la pagina 1
    addPatientsFromServer(1);
  }
}
function patientsFromServer(){
  $("#refreshPacients").button('loading');
  window.patientsIdsFromServer=[];
  addPatientsFromServer(1);
}
function addPatientsFromServer(page){
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
  for(patient in xhr.Patients){
    window.patientsIdsFromServer.push(xhr.Patients[patient].id);
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
        //window.memory.patients[mpatient].ultima_prestacion=xhr.Patients[patient].ultima_prestacion;
        //window.memory.patients[mpatient].proxima_prestacion=xhr.Patients[patient].proxima_prestacion;
        window.memory.patients[mpatient].geo.latitud=xhr.Patients[patient].geo.latitud;
        window.memory.patients[mpatient].geo.longitud=xhr.Patients[patient].geo.longitud;
        break;
      }
    }
    if(flag==0){memory.patients.push({// Si no existe creo el paciente
      "id":xhr.Patients[patient].id,
      "name":xhr.Patients[patient].name,
      "lastname":xhr.Patients[patient].lastname,
      "dir":xhr.Patients[patient].dir,
      "phone":xhr.Patients[patient].phone,
      "dni":xhr.Patients[patient].dni,
      "prestaciones":xhr.Patients[patient].prestaciones,
      //"ultima_prestacion":xhr.Patients[patient].ultima_prestacion,
      //"proxima_prestacion":xhr.Patients[patient].proxima_prestacion,
      "geo":{"latitud":xhr.Patients[patient].geo.latitud,"longitud":xhr.Patients[patient].geo.longitud},
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
  var template_panel_paciente_props;
  var paciente;
  for(patient in patients){
    paciente=patients[patient];
    template_panel_paciente_props = {
    	'{PACIENTE_ID}': paciente.id,
      '{FIRST_NAME}': paciente.name,
    	'{LAST_NAME}': paciente.lastname,
      '{DIR}': paciente.dir,
    	'{PROFILE_IMAGE}': "images/img/old.svg",
    	'{PRESTACIONES}': parsePrestacionesName(paciente.prestaciones)
    }
    if($("#paciente-"+paciente.id+"-").length == 0){// Si no existe lo agrega
      $("#pacients-container").append(parseTemplate(template_panel_paciente_props,TEMPLATE_PANEL_PACIENTE));
    }else{// Si existe lo remplasa
      $("#paciente-"+paciente.id+"-").replaceWith(parseTemplate(template_panel_paciente_props,TEMPLATE_PANEL_PACIENTE));
    }

  }

}
function addLoader(){
  return '<div class="panel fade in panel-default" data-init-panel="true" style="background: gainsboro;" id="pcloader"><div class="panel-body"><div class="search-result-item"><p class="text-center"><strong><i class="fa fa-spinner fa-spin fa-4x"></i></strong></p>        </div>        <!-- /.search-result-item -->    </div>    <!-- /.panel-body --></div>';
}
var TEMPLATE_PANEL_PACIENTE = ''
+'<div class="panel fade in panel-default" data-search="{FIRST_NAME} {LAST_NAME} {DIR}" id="paciente-{PACIENTE_ID}-" data-init-panel="true">'
+'    <div class="panel-body">'
+'        <div class="search-result-item">'
+''
+'            <div class="media mb-2x">'
+'                <div class="media-left">'
+'                    <a href="paciente.html?id={PACIENTE_ID}" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="{PROFILE_IMAGE}" alt="">'
+'                    </a>'
+'                </div>'
+'                <!-- /.media-left -->'
+'                <div class="media-body">'
+'                    <a href="paciente.html?id={PACIENTE_ID}" style="color: rgba(22,24,27,.87);"><p class="media-heading"><strong>{FIRST_NAME} {LAST_NAME}</strong>'
+'                        <br><small class="text-muted"><i class="fa fa-map-marker fa-fw"></i>{DIR}</small></p></a>'
+'                </div>'
+'                <!-- /.media-body -->'
+'            </div>'
+'            <p><strong>Prestaciones:</strong> {PRESTACIONES} </p>'
+'        </div>'
+'        <!-- /.search-result-item -->'
+'    </div>'
+'    <!-- /.panel-body -->'
+'</div>';
