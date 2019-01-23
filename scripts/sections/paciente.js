// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()
  // verEnMapa
  // agregarComentario
  // textComentario
  // editCommentInput
  //editCommentButton

  var pid=getQueryVariableTranslated("id");
  alert('Paciente '+pid)
  if(pid > 9999999){
    bootbox.dialog({
      message: 'No se puede realizar prestaciones sobre pacientes pendientes.',
      title: 'Paciente Pendiente',
      buttons: {
        success: {
          label: 'Aceptar',
          className: 'btn-success',
          callback: function() {
            window.location='pacientes.html';
          }
      }
      }
    });
}

  loadPatient();

  $( "#agregarVisita" ).click(function() {
    agregarVisita(this);
  });verEnMapa

  $( "#verEnMapa" ).click(function() {
    distanciaEnElMapa();
  });

  $( "#refreshPacient" ).click(function() {
    selectPatientFromServer();
  });

  $("#id").click(function(){
      agregar(this);
      alert('Fin de ')
  });

});

function loadPatient(){
  var pid=getQueryVariableTranslated("id");
  var patient=searchPatientInArr(pid);
  console.log('Matias ==>'+pid+"--"+JSON.stringify(patient)+'Last Sync hoy '+patient.lastSync);
  if(patient.lastSync!=null){// busco el paciente en el array
    if(needsSync(patient.lastSync)){
      console.log('loadPatient paso 1');
      selectPatientFromServer();
    }else{
      console.log('loadPatient paso 2');
      parsePaciente(patient);
    }
    }else{// si es la primera vez trae desde la pagina 1
    selectPatientFromServer();
  }
}

function openPacientMap(){
  window.location='gps.html?id='+getQueryVariableTranslated("id")+"&lat="+window.gpslocation.latitude+"&lng="+window.gpslocation.longitude;
}
function selectPatientFromServer(){
  //$("#pacients-container").append(addLoader());
  $("#refreshPacient").button('loading');
  var pid=getQueryVariableTranslated("id");
  console.log('selectPatientFromServer paso 1 // paciente id ='+pid+'  token ='+user.token);
  var jqxhr = $.ajax({
                  method: "GET",
                  url: apiurl+'api/patients/'+pid,
                  headers: { 'Authorization': user.token }
                })
                .done(function(xhr) {
                  //$( "#pcloader" ).remove();
                  $("#refreshPacient").button('reset');
                  managePatientServer(xhr);
                  parsePaciente(xhr);
                  testIfPendient();
                })
                .fail(function(xhr) {generalErrors(xhr);});
}

function managePatientServer(paciente){
  var sync=new Date();
  var flag;
  for(mpatient in window.memory.patients){
    if(paciente.id==window.memory.patients[mpatient].id){// Si existe actualizo el paciente
      window.memory.patients[mpatient].name=paciente.name;
      window.memory.patients[mpatient].lastname=paciente.lastname;
      window.memory.patients[mpatient].dir=paciente.dir;
      window.memory.patients[mpatient].phone=paciente.phone;
      window.memory.patients[mpatient].dni=paciente.dni;
      window.memory.patients[mpatient].prestaciones=paciente.prestaciones;
      //window.memory.patients[mpatient].ultima_prestacion=paciente.ultima_prestacion;
      //window.memory.patients[mpatient].proxima_prestacion=paciente.proxima_prestacion;
      //window.memory.patients[mpatient].frecuencia=paciente.frecuencia;
      window.memory.patients[mpatient].geo.latitud=paciente.geo.latitud;
      window.memory.patients[mpatient].geo.longitud=paciente.geo.longitud;
      window.memory.patients[mpatient].lastSync=sync;
      window.memory.patients[mpatient].Visitas=paciente.Visitas;// Todas las syncronizadas
      setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
      break;
      // Si estoy aca es que hay internet, sincronizar las pendientes y volver a cargar, poner cargar sincronizando
    }
    }
}
function parsePaciente(paciente){
  $( "#prestaciones-realizar").html(addPosiblePrestaciones(paciente.prestaciones));
  template_panel_paciente_props = {
    '{PACIENTE_ID}': paciente.id,
    '{PACIENTE_NOMBRE}': paciente.name,
    '{PACIENTE_APELLIDO}': paciente.lastname,
    '{PACIENTE_DIRECCION}': paciente.dir,
    '{PACIENTE_IMAGE}': "images/img/old.svg",
    //'{ULTIMA_PRESTACION}': parseDate(paciente.ultima_prestacion),
    //'{PROXIMA_PRESTACION}': parseDate(paciente.proxima_prestacion),
    '{PRESTACIONES}': parsePrestacionesInput(paciente.prestaciones),
    '{DERIVAR}': parseDerivarInput(),
    '{TELEFONO}': paciente.phone,
    '{DNI}': paciente.dni
  }
  $( "#pcloader" ).remove();
  $("#paciente-datos").html(parseTemplate(template_panel_paciente_props,PANEL_DATOS_PACIENTE));
  parseVisitas(paciente.Visitas);
}
function addVisitToHtml(xhr){
  var pid=getQueryVariableTranslated("id");
  var paciente=searchPatientInArr(pid);
  paciente.Visitas.unshift(xhr);
  setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
  parseVisitas(paciente.Visitas);
}
function addCommentToHtml(xhr){
  var pid=getQueryVariableTranslated("id");
  var paciente=searchPatientInArr(pid);
  for(visita in paciente.Visitas){
    if(paciente.Visitas[visita].id==xhr.id){
      console.log(xhr);
      paciente.Visitas[visita]=xhr;
      paciente.Visitas[visita].details.reverse();// Me lo trae al revez sino
      break;
    }
  }
  setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
  parseVisitas(paciente.Visitas);
}
function parseVisitas(visitas){
  // Faltaria agregar las no sincronizadas
  $("#panel-prestaciones").empty();
  var i=0;
  var template_prestacion;
  var contenido;
  var sync_pres='';
  for (vista in visitas){
    contenido='';
    for(detalle in visitas[vista].details){
      if(contenido!=''){contenido+='</br>';}
      contenido+=visitas[vista].details[detalle].detail;
    }
    template_prestacion = {
    	'{PRESTACION_FECHA}': parseDate(visitas[vista].created_at),
      '{SYNC_STATUS}': true,
      '{PRESTACION_ID}': visitas[vista].id,
      '{CONTENIDO}': contenido,
    	'{PROFILE_IMAGE}': "images/img/doctor.svg",
      '{PRESTACIONES}': parsePrestacionesName(visitas[vista].prestaciones)
    }
    var prestacion=parseTemplate(template_prestacion,PANEL_PRESTACION);
    if(i==0){
      i++;
      template_ultima_prestacion = {
        '{PROFILE_IMAGE}': "images/img/doctor.svg",
      	'{PRESTACION_ID}': visitas[vista].id,
      	'{PRESTACION}': prestacion
      }
      template_ultima_prestacion_fin = {
        '{SYNC_STATUS}': true,
      	'{PRESTACIONES}': parseTemplate(template_ultima_prestacion,TEMPLATE_ULTIMA_PRESTACION)
      }
      // ver si existe el id, sino existe append sino remplazar
      $("#panel-prestaciones").append(parseTemplate(template_ultima_prestacion_fin,TEMPLATE_CONTAINER));
    }else{
      sync_pres+=prestacion;
    }
  }
  // Agregar las presentaciones syncronizadas
  prestaciones_sync_fin = {
    '{SYNC_STATUS}': true,
    '{PRESTACIONES}': '<div class="timeline-panel panel fade in panel-default panel-fill" data-fill-color="true" data-init-panel="true">'+ sync_pres+'</div>'
  }
  $("#panel-prestaciones").append(parseTemplate(prestaciones_sync_fin,TEMPLATE_CONTAINER));
  // Fin Agregar las presentaciones syncronizadas
}
/* Agregar comentarios */
function distanciaEnElMapa(){
  bootbox.dialog({
    message: 'Usted se encuentra a '+distanciaDeRefernciaEnMts()+' metros del lugar a realizar la visita.',
    title: 'A '+distanciaDeRefernciaEnMts()+' metros',
    buttons: {
        cancel: {
            label: 'Mapa',
            className: 'btn-info',
            callback: function() {
              openPacientMap();
            }
        },
      success: {
        label: 'Aceptar',
        className: 'btn-success'
      }
    }
  });
}
function agregarComentario(el,id){
    // Si la visita no esta sincronizada no te permite comentar!
    $(el).button('loading');
    if($("#editCommentInput").val().length>2){
      var datas=JSON.stringify({"visit_id":id,"detail":$("#editCommentInput").val()});
      var pid=getQueryVariableTranslated("id");
      var jqxhr = $.ajax({
                      method: "PUT",
                      url: apiurl+'api/patients/'+pid+'/visits/edit',
                      headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                      data: datas
                    })
                    .done(function(xhr) {
                      //$( "#pcloader" ).remove();
                      // Agregar comentario a la visita como sync
                      toastr.success('Comentario agregado correctamente');
                      addCommentToMemory(xhr,true);
                      addCommentToHtml(xhr);
                      console.log(JSON.stringify(xhr));
                      testIfPendient();
                    })
                    .fail(function(xhr) {console.log(JSON.stringify(xhr));
                      // Agregar comentario a la visita pendiente sync
                      addCommentToMemory({'pid':pid,'data':datas},false);
                      toastr.info('Comentario pendiente de sincronización');
                    })
                    .always(function(){
                      $("#editCommentInput").val("");
                      $(el).button('reset');
                    });
  }else{
    $(el).button('reset');
    bootbox.dialog({
      message: 'No se pueden agregar comentarios vacíos',
      title: 'Comentario vacío',
      buttons: {
        success: {
          label: 'Aceptar',
          className: 'btn-success'
        }
      }
    });
  }
}
/* Agregar una visita */
function agregarVisita(el){
    $(el).button('loading');
    var prestaciones = getSelectedPrestaciones();
    if($("#textComentario").val().length>2 && prestaciones.length>0){
      var pid=getQueryVariableTranslated("id");
      var date=parseDateToServer(new Date());
      var dirGps=getGpsDir();
      var dir = dirGps.dir;
      var lat= dirGps.lat;
      var lng= dirGps.lng;
      var loct= lat+";"+lng;
      var caso_id=5;// Que es esto?
      var datas=JSON.stringify({
        "detail":$("#textComentario").val(),
        "created_at":date,
        "update_at": date,
        "dir": dir,
        "location": lat+";"+lng,
        "id_paciente": pid,
        "prestaciones":prestaciones,
        "id_prestador": user.prestador_id,
        "detail": $("#textComentario").val(),
        "caso_id": 5,
        "geo": {
    		        "latitud": lat,
    		        "longitud": lng
    		    }
          });
      //console.log(apiurl+'api/patients/'+pid+'/visits/new');
      console.log(datas);
      var jqxhr = $.ajax({
                      method: "POST",
                      url: apiurl+'api/patients/'+pid+'/visits/new',
                      headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                      data: datas
                    })
                    .done(function(xhr) {
                      //$( "#pcloader" ).remove();
                      console.log(JSON.stringify(xhr));
                      addVisitToMemory(xhr,true);
                      addVisitToHtml(xhr);
                      toastr.success('Visita agregada correctamente');
                      testIfPendient();
                    })
                    .fail(function(xhr) {console.log(JSON.stringify(xhr));
                      addVisitToMemory({'pid':pid,'data':datas},false);
                      toastr.info('Visita pendiente de sincronización');
                    })
                    .always(function(){
                      $("#textComentario").val("");
                      $(el).button('reset');
                    });
  }else{
    $(el).button('reset');
    if($("#textComentario").val().length<2){
      bootbox.dialog({
        message: 'No se pueden agregar detalles vacíos',
        title: 'Detalle vacío',
        buttons: {
          success: {
            label: 'Aceptar',
            className: 'btn-success'
          }
        }
      });
    }else{// No eligio prestaciones
      bootbox.dialog({
        message: 'No se puede generar una visita sin ninguna prestación seleccionada',
        title: 'Sin prestaciones seleccionadas',
        buttons: {
          success: {
            label: 'Aceptar',
            className: 'btn-success'
          }
        }
      });
    }
  }
}

//Matias 20190104
/* Agregar una derivacion */
function agregarDerivar(el){

    var derivarPrestadorId=document.getElementById("derPres").value;
    var pid=getQueryVariableTranslated("id");
    alert('Derivar nuevo '+derivarPrestadorId+'  '+pid+'   '+el);
    $(el).button('loading');
}
// fin 20190104



function addPosiblePrestaciones(prestaciones){
  	var txt='';
  	for(prestacion in prestaciones){
  		txt+='<div class="nice-checkbox nice-checkbox-inline"  style="margin-left: 10px;margin-top: 5px;"> <input class="checkbox-o" type="checkbox" name="niceCheckAlt" value="'+prestaciones[prestacion].prestacion_id+'" id="niceCheckAlt'+prestaciones[prestacion].prestacion_id+'" ><label for="niceCheckAlt'+prestaciones[prestacion].prestacion_id+'">'+prestaciones[prestacion].nombre+'</label></div>';
  	}
    if(txt.length>0){return txt;}else{
      return 'Sin prestaciones asignadas';
    }
}
function getSelectedPrestaciones(){
  var prestaciones =[];
  $( "#prestaciones-realizar input:checked").each(function() {
       prestaciones.push(parseInt($(this).val()));
     });
  return prestaciones;
}
/*
<!--/nice-checkbox-->
<div class="nice-checkbox nice-checkbox-inline">
  <input class="checkbox-o" type="checkbox" name="niceCheckAlt" id="niceCheckAlt2">
  <label for="niceCheckAlt2">Observacion</label>
</div><!--/nice-checkbox-->
<div class="nice-checkbox nice-checkbox-inline">
  <input class="checkbox-o" type="checkbox" name="niceCheckAlt" id="niceCheckAlt3">
  <label for="niceCheckAlt3">Malestar</label>
</div><!--/nice-checkbox-->
*/

var TEMPLATE_CONTAINER=''
+'<li class="timeline-item">'
+'<div class="timeline-badge">'
+'  <a class="{SYNC_STATUS}" rel="tooltip" title="" data-container="body" href="#" data-original-title="Post"></a>'
+'</div>'
+'{PRESTACIONES}'
+'</li>';
var TEMPLATE_ULTIMA_PRESTACION=''
+'<div class="timeline-panel panel fade in panel-default panel-fill" data-fill-color="true" data-init-panel="true">'
+'  {PRESTACION}'
+'  <div class="panel-footer timeline-livelines">'
+'      <a class="kit-avatar kit-avatar-28 no-border pull-left" href="#">'
+'        <img class="media-object" src="{PROFILE_IMAGE}">'
+'      </a>'
+'      <div class="input-group input-group-in no-border">'
+'        <input class="form-control" id="editCommentInput" placeholder="Agregar comentario">'
+'        <div class="input-group-btn">'
+'          <button id="#editCommentButton" onclick="agregarComentario(this,{PRESTACION_ID})" class="btn" data-loading-text="<i class=\'fa fa-spinner fa-spin\'></i>"><i class="fa fa-chevron-circle-right"></i></button>'
+'        </div>'
+'      </div>'
+'  </div><!-- /.panel-footer -->'
+'</div>';

var PANEL_PRESTACION=''
+'  <div class="panel-body">'
+'    <div class="media mb-2x">'
+'      <div class="media-left">'
+'        <a href="#" class="timeline-avatar kit-avatar kit-avatar-36">'
+'          <img class="media-object" src="{PROFILE_IMAGE}" alt="">'
+'        </a>'
+'      </div><!-- /.media-left -->'
+'      <div class="media-body">'
+'        <p class="media-heading"><strong>{PRESTACIONES}</strong> <br><small class="text-muted">{PRESTACION_FECHA}</small></p>'
+'      </div><!-- /.media-body -->'
+'    </div><!-- /.media -->'
+'    <p>{CONTENIDO}</p>'
+'  </div><!-- /.panel-body -->'
+'  <!-- /.panel-body -->';

// Datos del paciente

var PANEL_DATOS_PACIENTE=''
+'  <div class="float-bar clearfix">'
+'    <div class="float-bar-brand">'
+'      <a class="kit-avatar kit-avatar-128 no-padding border-white" href="#">'
+'        <img alt="cover" src="{PACIENTE_IMAGE}">'
+'      </a>'
+'    </div>'
+'    <div class="col-sm-8">'
+'      <div class="visible-xs">'
+'        <h2 class="display-name media-heading text-teal">{PACIENTE_NOMBRE} {PACIENTE_APELLIDO}</h2>'
+'        <p class="text-muted mb-4x" onclick="openPacientMap();"> <span><i class="fa fa-map-marker fa-fw"></i>{PACIENTE_DIRECCION}</span></p>'
+'      </div>'
+'      <div class="hidden-xs">'
+'        <h2 class="media-heading text-light">{PACIENTE_NOMBRE} {PACIENTE_APELLIDO}</h2>'
+'        <p class="mb-4x text-light" onclick="openPacientMap();"><span><i class="fa fa-map-marker fa-fw"></i> {PACIENTE_DIRECCION}</span></p>'
+'      </div>'
+'      <div class="mt-4x">'
+'        <div class="panel fade in panel-default panel-fill" data-fill-color="true" data-init-panel="true">'
+'          <div class="panel-body">'
+'            <form role="form">'
+'              <div class="form-group">'
+'                <label class="control-label" for="mask-phonecode">Teléfono </label>'
+'                <div class="input-group input-group-in">'
+'                  <span class="input-group-addon"><i class="fa fa-phone"></i></span>'
+'                  <input data-mask="phone_with_ddd" id="mask-phonecode" class="form-control" placeholder="{TELEFONO}" disabled="">'
+'                </div><!-- /input-group-in -->'
+'              </div>'
+'              <div class="form-group">'
+'                <label class="control-label" for="mask-dni">Dni </label>'
+'                <div class="input-group input-group-in">'
+'                  <span class="input-group-addon"><i class="fa fa-user"></i></span>'
+'                  <input data-mask="mask-dni" id="mask-dni" class="form-control" placeholder="{DNI}" disabled="">'
+'                </div><!-- /input-group-in -->'
+'              </div>'
+'              <div class="form-group">'
+'                <label class="control-label" for="mask-datetime">Prestaciones</label>'
+'                {PRESTACIONES}'
+'              </div><!--/form-group-->'
// Matias 20190103
+'              <div class="form-group">'
+'                <label class="control-label" for="mask-derivar">Selecione un Prestador</label>'
+'                {DERIVAR}'
+'              </div><!--/form-group-->'
// Matias 20190104
+'<div class="pull-right">'
+'  <button class="btn btn-primary" data-loading-text="<i class='+"'fa fa-spinner fa-spin'"+ '></i> Derivando" id="idDerivar">Derivar</button>'
+'</div>'
// Fin 20190104

+'              <!--/form-group-->'
+'            </form><!--/form-->'
+'          </div><!-- /panel-body -->'
+'        </div>'
+'      </div>'
+'    </div><!-- /.media-body -->'
+'  </div><!-- /.float-bar -->'
