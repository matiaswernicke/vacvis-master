// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()

  //addPatientsFromServer(1);
  // refreshPacients
  var pid=getQueryVariableTranslated("id");
  //prestadores(); // Levantar los prestadores a memoria


 //alert('window.memory.patients '+window.memory.patients)
 var patients = window.memory.patients;
 for(patient in patients){
   paciente=patients[patient];
   console.log('Paciente Derivar '+paciente.id);
   if(paciente.id == pid){
     document.getElementById("nombre").value = paciente.name;
     document.getElementById("apellido").value = paciente.lastname;
     break;
   }
 }

derivaciones();

  //loadPatient();
//  alert('Pacientes Derivar '+pid+'   '+window.user.prestador_name)
});

var select_prestadores=parseDerivarInput();

//$("#prestadores").html(select_prestadores); // Mostrar en el div el selet de los prestadores

function derivaciones(){
  //alert('derivaciones nuevo');
  const user = JSON.parse(getCookie("user"))
  var template_panel_aceptarDerivar_props;
  console.log('url = '+apiurl+'api/prestadores');
  console.log('token = '+user.token);
  var jqxhr = $.ajax({
                  method: "GET",
                  url: apiurl+'api/prestadores/derivaciones',
                  headers: { 'Authorization': user.token}
                })
                .done(function(xhr) {
                  var derivations =  xhr.derivaciones;
                  var derivo;
                  var cantidad = 0;
                  for(derivation in derivations){
                    derivo = derivations[derivation];
                    if(derivo.tipo_derivacion == 'receptor' && derivo.estado == 'Pendiente'){
                      //console.log('drivacion = '+derivo.prestador_id+'  '+derivo.derivacion_id+'  '+derivo.paciente.id+' '+derivo.paciente.lastname+' '+derivo.paciente.name);
                      //console.log('Paciente = '+paciente);
                      var cantidad = parseInt(cantidad) + parseInt(1);
                      template_panel_aceptarDerivar_props = {
                        '{PACIENTE_ID}': derivo.paciente.id,
                        '{DERIVAR_ID}': derivo.derivacion_id,
                        '{FIRST_NAME}': derivo.paciente.name,
                        '{LAST_NAME}': derivo.paciente.lastname,
                        '{DIR}': derivo.paciente.dir,
                        '{PROFILE_IMAGE}': "images/img/old.svg",
                        '{DERIVE_IMAGE}': 'images/img/ok.svg'
                      }
                      if($("#paciente-"+paciente.id+"-").length == 0){// Si no existe lo agrega
                        $("#derivar-container").append(parseTemplate(template_panel_aceptarDerivar_props,TEMPLATE_PANEL_ACEPTARDERIVAR));
                      }else{// Si existe lo remplasa
                        $("#paciente-"+paciente.id+"-").replaceWith(parseTemplate(template_panel_aceptarDerivar_props,TEMPLATE_PANEL_ACEPTARDERIVAR));
                      }
                    }
                  } // Fin del for
                  //document.getElementById("cantidad").value = 4;
                  //var cantidad = 4;
                  document.getElementById("titulo").innerHTML = "<h2>Derivaciones Pendientes ("+cantidad+")</h2>"
                })
                .fail(function(xhr) {
                  toastr.info('No se pudo leer las derivaciones');
                  //$("#refreshLoader").button('reset');
                })
                .always(function(){
                  $("#pendientes").html(select_prestadores); // Mostrar en el div el selet de los prestadores
                  //alert('Always')
                })
}


function aprobarDerivacion(id){
    if(id > 0){
      //------- grabarDerivar
      //var datas=JSON.stringify({"motivo":motivo,"prestador_derivado_id": derivarPrestadorId,"paciente_id":pid});
      console.log('Autorization = '+user.token);
      var jqxhr = $.ajax({
                    method: "POST",
                    url: apiurl+'api/prestadores/derivaciones/'+id+'/aprobar',
                    headers: { 'Authorization': user.token, 'Content-Type':"application/json" }
                  })
                  .done(function(xhr) {
                    console.log('Done => '+JSON.stringify(xhr));
                    //$( "#pcloader" ).remove();
                    // Agregar comentario a la visita como sync
                    toastr.success('Derivación confirmada correctamente');
                    console.log(JSON.stringify(xhr));
                    $(el).button('reset');
                    window.location="pacientes.html";
                  })
                  .fail(function(xhr) {//console.log(JSON.stringify(xhr));
                    //console.log('Fail (Aprobar) => '+xhr.Message);
                    // Agregar comentario a la visita pendiente sync
                    //addCommentToMemory({'pid':pid,'data':datas},false);
                    toastr.info('No se pudo realizar la confirmación de la derivación. Intente mas tarde');
                  })
                  .always(function(){
                    console.log('Siempre');
                    //$(el).button('reset');
                  })
                  //------- Fin grabarDerivar
      //alert('Termino grabarDerivar nuevo '+derivarPrestadorId+'  '+pid+'   '+el);
    }

}

function cancelarDerivacion(id){
    if(id > 0){
      console.log('Autorization = '+user.token);
      var jqxhr = $.ajax({
                    method: "POST",
                    url: apiurl+'api/prestadores/derivaciones/'+id+'/cancelar',
                    headers: { 'Authorization': user.token, 'Content-Type':"application/json" }
                  })
                  .done(function(xhr) {
                    console.log('Done => '+JSON.stringify(xhr));
                    toastr.success('Derivación cancelada correctamente');
                    console.log(JSON.stringify(xhr));
                    $(el).button('reset');
                    window.location="pacientes.html";
                  })
                  .fail(function(xhr) {console.log(JSON.stringify(xhr));
                    console.log('Fail (Cancelar) => '+JSON.stringify(xhr));
                    // Agregar comentario a la visita pendiente sync
                    //addCommentToMemory({'pid':pid,'data':datas},false);
                    toastr.info('No se pudo realizar la cancelación de la derivación. Intente mas tarde');
                  })
                  .always(function(){
                    console.log('Siempre');
                    //$(el).button('reset');
                  })
                  //------- Fin grabarDerivar
      //alert('Termino grabarDerivar nuevo '+derivarPrestadorId+'  '+pid+'   '+el);
    }

}

var TEMPLATE_PANEL_ACEPTARDERIVAR = ''
+'<div class="panel fade in panel-default" data-search="{FIRST_NAME} {LAST_NAME} {DIR}" id="paciente-{PACIENTE_ID}-" data-init-panel="true">'
+'    <div class="panel-body">'
+'        <div class="search-result-item">'
+'            <div class="media mb-2x">'
+'                <div class="media-left timeline-avatar kit-avatar kit-avatar-36">'
//+'                    <a href="" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="{PROFILE_IMAGE}" alt="">'
//+'                    </a>'
+'                </div>'
+'                <!-- /.media-left -->'
+'                <div class="media-body">'
+'                    <p class="media-heading"><strong>{FIRST_NAME} {LAST_NAME} {DERIVAR_ID}</strong>'
+'                        <br><small class="text-muted"><i class="fa fa-map-marker fa-fw"></i>{DIR}</small>'
//+'                        <br><p style="color:#FF0000";><b>{TIPO_PACIENTE}</b></p>'
+'                <!-- /.media-body -->'
+'                </div>'
// Matias 20190116
+'               <div class="media-right">'
+'                    <a href="javascript:aprobarDerivacion({DERIVAR_ID})" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="images/img/ok.svg" title="Derivar">'
+'                    </a>'
+'               </div>'
+'               <div class="media-right">'
+'                    <a href="javascript:cancelarDerivacion({DERIVAR_ID})" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="images/img/cancel.svg" title="Derivar">'
+'                    </a>'
+'               </div>'
+'        </div>'
+'        <!-- /.search-result-item -->'
+'    </div>'
+'    <!-- /.panel-body -->'
+'</div>';
