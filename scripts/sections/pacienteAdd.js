// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()

  //addPatientsFromServer(1);
  // refreshPacients
  $( "#refreshPacients" ).click(function() {
    //patientsFromServer();
  });

  $( "#m-name" ).html('<a>'+window.user.prestador_name+'</a> <small>'+window.user.prestador_email+'</small>');
  $( "#tot-vis" ).html(window.memory.visits.sync.length);
  $( "#tot-sync" ).html(window.memory.visits.pending.length);
  $( "#tot-com" ).html(window.memory.comment.pending.length);
  loadPendientes();

  $("#agregarPaciente").click(function(){
      agregarPaciente(this);
  });

});
//visitas-pendientes
// visitas-pendientes-bar
/*
<p class="help-block" id="visitas-pendientes-progreso">Progreso 50% - 3 de 6</p>
*/
/*
<div id="visitas-pendientes-bar" class="progress-bar bg-grd-teal" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width: 50%">
  <span class="sr-only">50% Completado</span>
</div>
*/
// comentarios
function agregarPaciente(el){

    var nombre=document.getElementById("nombre").value;
    var apellido=document.getElementById("apellido").value;
    var nroDoc=document.getElementById("nroDoc").value;
    var direc=document.getElementById("direc").value;
    var tel=document.getElementById("tel").value;
    var presta=document.getElementById("presta").value;

    var pid=window.user.prestador_id;

    console.log('agregarPaciente'+nombre+'  '+apellido+'   '+nroDoc+'   '+pid+'  '+direc+'  '+tel+'  '+presta);
    $(el).button('loading');

    // Controlar que esten todos los campos
    var error =''
    if(apellido.length < 1){var error = error+'El campo <b>Apellido</b> es obligatorio'+'<br>'};
    if(nombre.length < 1){var error = error+'El campo <b>Nombre</b> es obligatorio'+'<br>'};
    if(nroDoc.length < 1){var error = error+'El campo <b>Nro de Documento</b> es obligatorio'+'<br>'};

    if(error.length > 5){
      bootbox.alert({
        size: "small",
        title: 'Error en la carga',
        message: error,
          buttons: {
            ok:{
              label: 'Aceptar',
              className: 'btn-success'
            }
          },
        callback: function(){$(el).button('reset');}
      })
  } // fin if

  if(error.length < 1){
    var datas=JSON.stringify({"apellido":apellido,"nombre":nombre,"dni":nroDoc,"direccion":direc,"telefono":tel,"prestacion":presta});
    console.log('Autorization = '+user.token);
    console.log(datas);
    var jqxhr = $.ajax({
                    method: "POST",
                    url: apiurl+'api/patients',
                    headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                    data: datas
                  })
                  .done(function(xhr) {
                    console.log('Done => '+JSON.stringify(xhr));

                    toastr.success('Paciente agregado correctamente');
                    //console.log(JSON.stringify(xhr));
                    $(el).button('reset');
                    window.location="pacientes.html?senal=1";
                    //testIfPendient();
                  })
                  .fail(function(xhr) {console.log(JSON.stringify(xhr));
                    console.log('Fail => '+JSON.stringify(xhr));
                    // Agregar comentario a la visita pendiente sync
                    //addCommentToMemory({'pid':pid,'data':datas},false);
                    toastr.info('El Paciente No se pudo ingresar');
                  })
                  .always(function(){
                    document.getElementById("nombre").value = '';
                    document.getElementById("apellido").value = '';
                    document.getElementById("nroDoc").value = '';
                    $(el).button('reset');
                  })

  } // fin if
}


function loadPendientes(){
  $("#visitas-pendientes-bar").replaceWith('<div id="visitas-pendientes-bar" class="progress-bar bg-grd-teal" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">'+window.memory.visits.pending.length+' Pendientes</span></div>');
  $("#comentarios-pendientes-bar").replaceWith('<div id="comentarios-pendientes-bar" class="progress-bar bg-grd-teal" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">'+window.memory.comment.pending.length+' Pendientes</span></div>');
  $("#panel-prestaciones").empty();
  $("#panel-prestaciones").empty();
  $("#visitas-pendientes-progreso").html(window.memory.visits.pending.length+' Pendientes');
  $("#comentarios-pendientes-progreso").html(window.memory.comment.pending.length+' Pendientes');
  for(visitas in window.memory.visits.pending){
    console.log(JSON.stringify(window.memory.visits.pending[visitas]));
    var data=JSON.parse(window.memory.visits.pending[visitas].data);
    template_prestacion_pendiente = {
      '{IMG}': "images/img/doctor.svg",
      '{DATE}': data.created_at,
      '{TYPE}': 'Visita',
      '{COMMENT}':data.detail
    }
    $("#visitas-pendientes").append(parseTemplate(template_prestacion_pendiente,TEMPLATE_PANEL_PENDIENTE));
  }
  for(comentarios in window.memory.comment.pending){
    var data=JSON.parse(window.memory.comment.pending[comentarios].data);
    template_comentario_pendiente = {
      '{IMG}': "images/img/doctor.svg",
      '{DATE}': ' ',
      '{TYPE}': 'Comentario',
      '{COMMENT}':data.detail
    }
    $("#comentarios-pendientes").append(parseTemplate(template_comentario_pendiente,TEMPLATE_PANEL_PENDIENTE));
  }
}
var TEMPLATE_PANEL_PENDIENTE = ''
+'<div class="panel-body">'
+'    <div class="media mb-2x">'
+'      <div class="media-left">'
+'        <a href="#" class="timeline-avatar kit-avatar kit-avatar-36">'
+'          <img class="media-object" src="{IMG}" >'
+'        </a>'
+'      </div><!-- /.media-left -->'
+'      <div class="media-body">'
+'        <p class="media-heading"><strong>{TYPE}</strong> <br><small class="text-muted">{DATE}</small></p>'
+'      </div><!-- /.media-body -->'
+'    </div><!-- /.media -->'
+'    <p>{COMMENT}</p>'
+'  </div>';
