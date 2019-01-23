// traigo user desde antes
$(function() { // shorthand $() for $( document ).ready()

  //addPatientsFromServer(1);
  // refreshPacients
  var pid=getQueryVariableTranslated("id");

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

 $("#idDerivar").click(function(){
    agregarDerivar(this);
    alert('Fin de Derivar')
  });
  //loadPatient();
//  alert('Pacientes Derivar '+pid+'   '+window.user.prestador_name)
});

var select_prestadores=parseDerivarInput();

$("#prestadores").html(select_prestadores); // Mostrar en el div el selet de los prestadores


function agregarDerivar(el){
    var derivarPrestadorId=document.getElementById("derPres").value;
    var pid=getQueryVariableTranslated("id");
    var motivo=document.getElementById("motivo").value;
    $(el).button('loading');
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
                    //$( "#pcloader" ).remove();
                    // Agregar comentario a la visita como sync
                    toastr.success('Paciente derivado correctamente');
                    //addCommentToMemory(xhr,true);
                    //addCommentToHtml(xhr);
                    console.log(JSON.stringify(xhr));
                    $(el).button('reset');
                    //testIfPendient();
                  })
                  .fail(function(xhr) {console.log(JSON.stringify(xhr));
                    console.log('Fail => '+JSON.stringify(xhr));
                    // Agregar comentario a la visita pendiente sync
                    //addCommentToMemory({'pid':pid,'data':datas},false);
                    toastr.info('El Paciente No se pudo derivar. Intente mas tarde');
                  })
                  .always(function(){
                    //document.getElementById("nombre").value = '';
                    //document.getElementById("apellido").value = '';
                    //document.getElementById("nroDoc").value = '';
                    console.log('Siempre');
                    $(el).button('reset');
                  })
                  //------- Fin grabarDerivar
      alert('Termoni grabarDerivar nuevo '+derivarPrestadorId+'  '+pid+'   '+el);
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

function grabarDerivar(el){

    var derivarPrestadorId=document.getElementById("derPres").value;
    var pid=getQueryVariableTranslated("id");
    var motivo=getQueryVariableTranslated("motivo");

    console.log('grabarDerivar ==> '+derivarPrestadorId+'  '+pid+'  '+motivo);

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
                    //$( "#pcloader" ).remove();
                    // Agregar comentario a la visita como sync
                    toastr.success('Paciente derivado correctamente');
                    //addCommentToMemory(xhr,true);
                    //addCommentToHtml(xhr);
                    console.log(JSON.stringify(xhr));
                    $(el).button('reset');
                    //testIfPendient();
                  })
                  .fail(function(xhr) {console.log(JSON.stringify(xhr));
                    console.log('Fail => '+JSON.stringify(xhr));
                    // Agregar comentario a la visita pendiente sync
                    //addCommentToMemory({'pid':pid,'data':datas},false);
                    toastr.info('El Paciente No se pudo derivar. Intente mas tarde');
                  })
                  .always(function(){
                    //document.getElementById("nombre").value = '';
                    //document.getElementById("apellido").value = '';
                    //document.getElementById("nroDoc").value = '';
                    console.log('Siempre');
                    $(el).button('reset');
                  })

}
