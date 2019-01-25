$( document ).on( 'submit', '#signinForm', function(e){
    e.preventDefault();
    var $button = $("#signinForm [type=submit]");
    $button.button('loading');
    //alert($('#keepSignin').val());
    if($('#username').val()!="" &&  $('#password').val()!="" ){
      var datas = $(this).serializeArray();
      var jqxhr = $.ajax({
                      method: "POST",
                      url: apiurl+'login',
                      data: datas
                    })
                    .done(function(xhr) {
                      login(xhr);
                      //prestadores();
                    })
                    .fail(function(xhr) {
                      if(xhr.status==400){toastr.error('El usuario o la contraseña están mal');}
                      else if (xhr.status==500) { toastr.error('Error: Interno del servidor');}
                      else{toastr.error('Sin conexión');}
                    })
                    .always(function(){
                      $button.button('reset');
                    });
    }else{
      $button.button('reset');
      bootbox.dialog({
      	message: 'Los campos usuario y contraseña son necesarios.',
      	title: 'Campos vacíos',
      	buttons: {
      		success: {
      			label: 'Aceptar',
      			className: 'btn-success'
      		}
      	}
      });
    }

});
