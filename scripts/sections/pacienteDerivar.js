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
   //console.log('Paciente Derivar '+paciente.id);
   if(paciente.id == pid){
     //document.getElementById("nombre").value = paciente.name+'; '+paciente.lastname;
     document.getElementById("nombrePaciente").innerHTML = "<h4><b>"+paciente.name+' '+paciente.lastname+"</b></h4>"
     break;
   }
 }

prestadores();

  //loadPatient();
//  alert('Pacientes Derivar '+pid+'   '+window.user.prestador_name)
});

var select_prestadores=parseDerivarInput();

//$("#prestadores").html(select_prestadores); // Mostrar en el div el selet de los prestadores

function prestadores(){
  //alert('derivaciones nuevo');
  const user = JSON.parse(getCookie("user"))
  var template_panel_aceptarDerivar_props;
  console.log('url = '+apiurl+'api/prestadores');
  console.log('token = '+user.token);
  var jqxhr = $.ajax({
                  method: "GET",
                  url: apiurl+'api/prestadores',
                  headers: { 'Authorization': user.token}
                })
                .done(function(xhr) {
                  var prestadores =  xhr.Prestadores;
                  var derivo;
                  var cantidad = 0;
                  for(prestador in prestadores){
                    derivo = prestadores[prestador];
                      var cantidad = parseInt(cantidad) + parseInt(1);
                      template_panel_aceptarDerivar_props = {
                        '{PRESTADOR_ID}': derivo.id,
                        '{FIRST_NAME}': derivo.name,
                        '{PROFILE_IMAGE}': "images/img/doctor.svg", //"images/img/old.svg",
                        '{DERIVE_IMAGE}': 'images/img/ok.svg'
                      }
                      if($("#prestador-"+paciente.id+"-").length == 0){// Si no existe lo agrega
                        $("#derivar-container").append(parseTemplate(template_panel_aceptarDerivar_props,TEMPLATE_PANEL_ACEPTARDERIVAR));
                      }else{// Si existe lo remplasa
                        $("#paciente-"+paciente.id+"-").replaceWith(parseTemplate(template_panel_aceptarDerivar_props,TEMPLATE_PANEL_ACEPTARDERIVAR));
                      }

                  } // Fin del for

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

function agregarDerivar(prestador){
    var derivarPrestadorId=prestador // document.getElementById("derPres").value;
    var pid=getQueryVariableTranslated("id");
    var motivo=document.getElementById("motivo").value;
    //$(el).button('loading');
    if(derivarPrestadorId > 0){
      //------- grabarDerivar
      var datas=JSON.stringify({"motivo":motivo,"prestador_derivado_id": derivarPrestadorId,"paciente_id":pid});
      console.log('Autorization = '+user.token);
      console.log(datas);
      var jqxhr = $.ajax({
                    method: "POST",
                    url: apiurl+'api/prestadores/derivar',
                    headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                    data: datas
                  })
                  .done(function(xhr) {
                    console.log('Done => '+JSON.stringify(xhr));
                    toastr.success('Paciente derivado correctamente');
                    console.log(JSON.stringify(xhr));
                    //devolver con un get de marca para refrescar
                    window.location="pacientes.html?senal=1";
                  })
                  .fail(function(xhr) {//console.log(JSON.stringify(xhr));
                    var mensaje = JSON.parse(xhr.responseText)
                    //console.log('Fail(agregarDerivar) => '+mensaje.Message);
                    toastr.info(mensaje.Message);
                  })
                  .always(function(){
                    console.log('Siempre');
                    //$(el).button('reset');
                  })
                  //------- Fin grabarDerivar
      //alert('Termino grabarDerivar nuevo '+derivarPrestadorId+'  '+pid+'   '+el);
    }else{
      bootbox.alert({
        size: "small",
        title: 'Error en la carga',
        message: 'Debe seleccionar un prestador',
          buttons: {
            ok:{
              label: 'Aceptar',
              className: 'btn-success'
            }
          },
        callback: function(){$(el).button('reset');}
      })

    }

}

var TEMPLATE_PANEL_ACEPTARDERIVAR = ''
+'<div class="panel fade in panel-default" data-search="{FIRST_NAME} {LAST_NAME}" id="paciente-{PRESTADOR_ID}-" data-init-panel="true">'
+'    <div class="panel-body">'
+'        <div class="search-result-item">'
+'            <div class="media mb-2x">'
+'                <div class="media-left timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="{PROFILE_IMAGE}" alt="">'
+'                </div>'
+'                <!-- /.media-left -->'
+'                <div class="media-body">'
+'                    <p class="media-heading"><strong>{FIRST_NAME}</strong>'
//+'                        <br><small class="text-muted"><i class="fa fa-map-marker fa-fw"></i>{DIR}</small>'
+'                <!-- /.media-body -->'
+'                </div>'
// Matias 20190116
+'               <div class="media-right">'
+'                    <a href="javascript:agregarDerivar({PRESTADOR_ID})" class="timeline-avatar kit-avatar kit-avatar-36">'
+'                        <img class="media-object" src="images/img/ok.svg" title="Derivar">'
+'                    </a>'
+'               </div>'
// -----------------------
//+'            <p><strong>Prestaciones:</strong> {PRESTACIONES} </p>'
+'        </div>'
+'        <!-- /.search-result-item -->'
+'    </div>'
+'    <!-- /.panel-body -->'
+'</div>';
