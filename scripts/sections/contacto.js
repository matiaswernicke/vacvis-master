// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()
  $( "#contactoBtn" ).click(function() {
    agregarVisita(this);
  });
});
/* Agregar una visita */
function agregarVisita(el){
    $(el).button('loading');
    if($("#contactoContenido").val().length>2 && $("#contactoAsunto").val().length>2){
      var datas=JSON.stringify({
        "asunto":$("#contactoAsunto").val(),
        "cuerpo":$("#contactoContenido").val()
          });
      var jqxhr = $.ajax({
                      method: "POST",
                      url: apiurl+'api/contacto',
                      headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                      data: datas
                    })
                    .done(function(xhr) {
                      //$( "#pcloader" ).remove();
                      console.log(JSON.stringify(xhr));
                      $("#contactoAsunto").val("");
                      $("#contactoContenido").val("");
                      toastr.success('El contacto fue enviado correctamente');
                      testIfPendient();
                    })
                    .fail(function(xhr) {console.log(JSON.stringify(xhr));})
                    .always(function(){
                      $(el).button('reset');
                    });
  }else{
    $(el).button('reset');
    bootbox.dialog({
      message: 'El asunto y el detalle son obligatorios',
      title: 'Campos vacíos',
      buttons: {
        success: {
          label: 'Aceptar',
          className: 'btn-success'
        }
      }
    });
  }
}
