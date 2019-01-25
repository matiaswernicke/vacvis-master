function login(xhr){
  var expires_in = new Date();
  expires_in.setSeconds(expires_in.getSeconds() + xhr.expires_in);
  var token = xhr.token_type+" "+xhr.access_token;
  var userName= xhr.userName;
  var prestador_id= xhr.prestador_id;
  var prestador_name= xhr.prestador_name;
  var prestador_email= xhr.prestador_email;
  var prestador_alias= xhr.prestador_alias;
  var keepSignin = ($('#keepSignin').val() == $('#keepSignin').val() ? {"keepSignin":true,"datas":$('#signinForm').serializeArray()} : {"keepSignin":false});
  var user=JSON.stringify({"expires_in":expires_in,"token":token,"userName":userName,"prestador_id":prestador_id,"prestador_name":prestador_name,"prestador_email":prestador_email,"prestador_alias":prestador_alias,"keepSignin":keepSignin});
  setCookie("user", user, 120);
  setCookie("derivarName", '', 120);
  window.location="pacientes.html";
}

// un arreglo con visits {sync,pending}
// Una funcion que pregunta y devuelve si esta en sync o en pending
// un arreglo con patients, que adentro tienen las visitas
// needsSync(dateCheked)
if(getCookie("user")!=""){
  window.user=JSON.parse(getCookie("user"));
  var readUserMemory=getCookie("memory-user:"+window.user.prestador_id+"-");
	if(readUserMemory==""){// Si no esta inicializada
		window.memory={lastSync:null,patients:[],visits:{sync:[],pending:[]},comment:{sync:[],pending:[]}};
		setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
	}else{
		window.memory=JSON.parse(readUserMemory);
    //console.log("Leo la memoria"+JSON.stringify(window.memory));
	}
  // Si esta logueado
  setTimeout(function(){
    if(checkIfSyncPendient()){
      $( "#refreshLoader" ).append('<span class="dotted dotted-danger"></span>');
    }
      $( "#refreshLoader" ).click(function() {
        if(checkIfSyncPendient()){
          refreashLoader();
          $("#refreshLoader").button('loading');
        }else{
          toastr.success('Todo está sincronizado');
        }
      });
  }, 600);
}
//window.patientsIdsFromServer
function endLoadingPatients(){
	for(mpatient in window.memory.patients){
		if(window.patientsIdsFromServer.indexOf(window.memory.patients[mpatient].id)==-1){
			$("#paciente-"+window.memory.patients[mpatient].id+"-").remove();
			window.memory.patients.splice(mpatient, 1);
			mpatient--;
		}
	}
	window.memory.lastSync= new Date();
	setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
}
function addVisitToMemory(data,sync){
  // sync true o false!!
  if(sync){window.memory.visits.sync.push(data)}
  else{window.memory.visits.pending.push(data)}
  setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
}
// Matias 20190104
function addDeriveToMemory(data,sync){
  // sync true o false!!
  if(sync){window.memory.visits.sync.push(data)}
  else{window.memory.visits.pending.push(data)}
  setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
}


function addCommentToMemory(data,sync){
  // sync true o false!!
  if(sync){window.memory.comment.sync.push(data)}
  else{window.memory.comment.pending.push(data)}
  setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
}

// <span class="dotted dotted-danger"></span>
// $("#refreshLoader").button('loading');
// $("#refreshLoader").button('reset');

function checkIfSyncPendient(){
  return (window.memory.comment.pending.length>0|| window.memory.visits.pending.length>0);
}
function testIfPendient(){
  if(checkIfSyncPendient()){refreashLoader();}
}
function refreashLoader(){
  if(checkIfSyncPendient()){
    for(visitas in window.memory.visits.pending){
      updateVisitBack(window.memory.visits.pending[visitas],visitas);
      return;
    }
    for(comentario in window.memory.comment.pending){
      updateCommentBack(window.memory.comment.pending[comentario],comentario);
      return;
    }
  }else{
    location.reload();
  }
}
function updateVisitBack(pending,visitas){
  var pid=pending.pid;
  var jqxhr = $.ajax({
                  method: "POST",
                  url: apiurl+'api/patients/'+pid+'/visits/new',
                  headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                  data: pending.data
                })
                .done(function(xhr) {
                  //$( "#pcloader" ).remove();
                  console.log(JSON.stringify(xhr));
                  addVisitToMemory(xhr,true);
                  window.memory.visits.pending.splice(visitas, 1);
                  var paciente=searchPatientInArr(pid);
                  paciente.Visitas.unshift(xhr);
                  setCookie("memory-user:"+window.user.prestador_id+"-", JSON.stringify(window.memory), 120);
                  toastr.success('Visita pendiente sincronizada correctamente');
                  refreashLoader();
                })
                .fail(function(xhr) {
                  toastr.info('No se pudo iniciar la sincronización');
                  $("#refreshLoader").button('reset');
                })
}
function updateCommentBack(pending,comentario){
  var pid=pending.pid;
  var jqxhr = $.ajax({
                  method: "PUT",
                  url: apiurl+'api/patients/'+pid+'/visits/edit',
                  headers: { 'Authorization': user.token, 'Content-Type':"application/json" },
                  data: pending.data
                })
                .done(function(xhr) {
                  // Agregar comentario a la visita como sync
                  toastr.success('Comentario pendiente sincronizado correctamente');
                  addCommentToMemory(xhr,true);
                  window.memory.comment.pending.splice(comentario, 1)
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
                  refreashLoader();
                })
                .fail(function(xhr) {console.log(JSON.stringify(xhr));
                  // Agregar comentario a la visita pendiente sync
                  toastr.info('No se pudo iniciar la sincronización');
                  $("#refreshLoader").button('reset');
                });
}
function exitSession(){
  window.user="";
  setCookie("user", window.user, 120);
  window.location="login.html";
}
