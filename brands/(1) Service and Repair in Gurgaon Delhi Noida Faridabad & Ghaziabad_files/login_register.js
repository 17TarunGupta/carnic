/*
* File Name: login_register.js
* Description: login_register.js file has register and login scripts
* Created Date: 17 Nov 2017
* Created By: Naresh Shankar S <shankar@gaadizo.com>
* Modified Date & Reason:
*/
//for timer ---->starts
var i = 1;
var interval;
var time = 60;  // the animaion for 60s
var initialOffset = '440';
var intr=1100;
var backFromOtp=1;//1 =login 2=register
//for timer ---->Ends
function LoginOrREg(obj){
	var login="New User! Register Here";
	var register="Already Registered! Login";
	if(obj.text==login){
		$('#login-form').hide();
		$('#register-form').show();
		$('#myModalLabel').html('Register');
		obj.text=register;
	}else if(obj.text==register){
		$('#login-form').show();
		$('#register-form').hide();
		$('#myModalLabel').html('Login');
		obj.text=login;
	}
}
function fromOtpToBack(){
	resetTimer();
	$('#login_reg_back').hide();
	$('#timer_content').hide();
	//hidding the timer
	document.getElementById('timer_id').style.display=""; 
	// displaying the link fir resend otp
	document.getElementById('resend_otp').style.display="none";
	$('#login_regi_c_id').show();
	if(backFromOtp==1){
		$('#login-form').show();
		$('#register-form').hide();
	}else if(backFromOtp==2){
		$('#login-form').hide();
		$('#register-form').show();
	}
}
function resetTimer(){
	clearInterval(interval, 70);
	i = 1;
	time = 60;  // the animaion for 60s
	initialOffset = '440';
	$('.circle_animation').css('stroke-dashoffset', initialOffset-((i+1)*(initialOffset/time)));
	$('#otp_timer').text(time);
}
function openRegisterModal(){
	$('#login-form').hide();
	$('#register-form').show();
	$('#myModalLabel').html('Register');
	$('#LoginOrREgId').text("Already Registered! Login");
	$('#myModal').modal({backdrop: 'static', keyboard: false, show: true});
}
function openLoginModal(){
	$('#login-form').show();
	$('#register-form').hide();
	
	$('#login-form')[0].reset();
	$('#register-form')[0].reset();
	$('#otp-form')[0].reset();
	
	$('#otp-form').children('.alert').remove();
	$('#login-form').children('.alert').remove();
	$('#register-form').children('.alert').remove();
	
	$('#myModalLabel').html('Login');
	$('#LoginOrREgId').text("New User! Register Here");
	
	$('#timer_content').hide();
	$('#timer_content').hide();
	$('#resend_otp').hide();
	$('#login_regi_c_id').show();
	$('#login_reg_back').hide();
	if(typeof enquirysubmit != 'undefined')
		enquirysubmit=0;
	resetTimer();
	//hidding the timer
	document.getElementById('timer_id').style.display=""; 
	// displaying the link fir resend otp
	document.getElementById('resend_otp').style.display="none";
}
function resendOtp(url){
	$("#resend_otp").hide();
	$("#error_div_id").hide();
	
	$.ajax({url: url, success: function(result){
		if(result.status==1){
			startCounter();
		}else{
			var alertToDisplay='<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+result.msg+'</div>';
			$("form").prepend(alertToDisplay);
			
		}
    }});
}
function rmSocialLoginData(url){
	$.ajax({url: url, success: function(result){
    }});
}
function callTimer(){
	$("#timer_content").show();
	$("#login_regi_c_id").hide();
	
	interval = setInterval(function() {
		if(time-i>=0){
			$('#otp_timer').text(time-i);
			$('.circle_animation').css('stroke-dashoffset', initialOffset-((i+1)*(initialOffset/time)));
			
		}
		if (i == time){
			//var myVar = setInterval(interval, 0);
			//clearInterval(interval, 70);
			document.getElementById('timer_id').style.display="none"; //hidding the timer
			// displaying the link fir resend otp
			document.getElementById('resend_otp').style.display="";
			
		}
		i++; 
			
	}, intr);
}
$(".mob_number").on("keydown", function(e){
	return e.which == 69 || e.which == 107 ||  e.which == 109 ||  e.which == 110 ? false : true
});
$(".mob_number").on("input", function(e){
	var mVal=$(e.target).val();
	if (mVal.length > 10)
		mVal = mVal.slice(0,10);
}); 
$.validate({
    form : '#login-form',
	scrollToTopOnError : false,
    onSuccess : function($form) {
	var url=$form.attr('data-url');
	var dataToPass="loginMobile="+$('#login-form-mobile').val();
	dataToPass+="&_token="+$('#login_token').val();
	
	$.ajax({
        type: "post",
        url: url,
        cache: false,
        data: dataToPass,
        success: function(data) {
			if(data.status==1){
				backFromOtp=1;
				$('#login_reg_back').show();
				callTimer();
			}else if(data.status==0){
				$form.children('.alert').remove();
				$form.prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+data.msg+'</div>');
			}
        }
	});
    return false; // Will stop the submission of the form
    }
});
$.validate({
    form : '#otp-form',
	scrollToTopOnError : false,
    onSuccess : function($form) {
	var url=$form.attr('data-url');
	var dataToPass="otp="+$('#login-form-otp').val();
	dataToPass+="&_token="+$('#otp_token').val();
	$.ajax({
        type: "post",
        url: url,
        cache: false,
        data: dataToPass,
        success: function(data) {
			if(data.status==1){
				if(typeof(loggedIn)=='undefined')
					location.reload();
				else{
					makeLogin();
				}
			}else if(data.status==0){
				$form.children('.alert').remove();
				$form.prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+data.msg+'</div>');
			}
        }
	});
    return false; // Will stop the submission of the form
    }
});
$.validate({
    form : '#register-form',
	scrollToTopOnError : false,
	errorMessagePosition : 'top',
	submitErrorMessageCallback: function($form, errorMessages, config) {
		if (errorMessages[0]) {
			var errStr='<span class="help-block form-error">'+errorMessages[0]+'</span>';
			$('#rg_err_container').html(errStr);
		}
	},
    onSuccess : function($form) {
	var url=$form.attr('data-url');
	var dataToPass="registerName="+$('#register-form-name').val();
	dataToPass+="&registerEmail="+$('#register-form-email').val();
	dataToPass+="&registerMobile="+$('#register-form-mobile').val();
	dataToPass+="&registerReferalCode="+$('#register-form-referal-code').val();
	dataToPass+="&_token="+$('#register-form-token').val();
	$.ajax({
        type: "post",
        url: url,
        cache: false,
        data: dataToPass,
        success: function(data) {
			if(data.status==1){
				backFromOtp=2;
				$('#login_reg_back').show();
				callTimer();
			}else if(data.status==0){
				$form.children('.alert').remove();
				$form.prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+data.msg+'</div>');
			}else if(data.status==2){
				$('#already_reg_modal').modal({backdrop: 'static', keyboard: false, show: true});
				var content='<b> Account already registered with below details</b>';
				var resultData=data.data;
				resultData.forEach(function(arr,index){
					content+='<div class="row">';
					content+='<div class="col-xs-12">Name : '+arr["name"]+'</div>';
					content+='<div class="col-xs-12">Email : '+arr["email_id"]+'</div>';
					content+='<div class="col-xs-12">Mobile Number : '+arr["mobile_number"]+'</div>';
					content+='<div class="col-xs-12"><button class="btn btn-success btn-sm pull-right" onclick="alreadyRegSubmit(\''+arr["mob_no"]+'\')" name="send Otp">Send OTP</button></div>';
					content+='</div>';
				});
				$('#already_modal_content').html(content);
			}
        }
	});
    return false; // Will stop the submission of the form
    }
});
function startCounter(){
	i=0;
	setInterval(interval, intr);
	document.getElementById('resend_otp').style.display="none";
	// showing timer 
	document.getElementById('timer_id').style.display="";
}
function alreadyRegSubmit(mobNo){
	var url=$('#already_login_url').val();
	var dataToPass="loginMobile="+mobNo;
	dataToPass+="&_token="+$('#login_token').val();
	
	$.ajax({
        type: "post",
        url: url,
        cache: false,
        data: dataToPass,
        success: function(data) {
			if(data.status==1){
				backFromOtp=1;
				$('#login_reg_back').show();
				$('#already_reg_modal').modal('hide');
				callTimer();
			}else if(data.status==0){
				$('#already_modal_content').prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+data.msg+'</div>');
			}
        }
	});
}
function socialLoginSubmit(mobNo){
	var url=$('#social_login_url').val();
	var dataToPass="registerMobile="+mobNo;
	dataToPass+="&_token="+$('#social_login_token').val();
	
	$.ajax({
        type: "post",
        url: url,
        cache: false,
        data: dataToPass,
        success: function(data) {
			if(data.status==1){
				backFromOtp=1;
				$('#login_reg_back').show();
				$('#already_reg_modal').hide();
				callTimer();
			}else if(data.status==0){
				$('#already_modal_content').prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+data.msg+'</div>');
			}
        }
	});
}