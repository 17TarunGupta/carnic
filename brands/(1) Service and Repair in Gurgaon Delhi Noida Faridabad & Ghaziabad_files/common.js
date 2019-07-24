var app = angular.module('myApp', [],function($interpolateProvider) {
	$interpolateProvider.startSymbol('<*');
	$interpolateProvider.endSymbol('*>');
}); 
app.controller('cartCtrl', function($scope,$rootScope,$http) {
	$http.get(cartUrl).then(function(response) {
		var responsData=response.data;
		$rootScope.CartData = responsData.data;
		$rootScope.CalTotAmount();
	});
	$rootScope.cartValidationMsg="";
	$rootScope.reddemablePoint=0;
	$rootScope.reddemAvailPoint=0;
	$rootScope.reddemYes=reddemYes;
	$rootScope.totAmntAfterRedeem=0;
	$rootScope.reset=function(){
		$rootScope.CartData.modelChanged=0;
	}
	$rootScope.CalTotAmount=function(){
		var totAmount=0;
		angular.forEach($rootScope.CartData.items, function(value, key) {
			totAmount+=parseFloat(value.totAmount);
		})
		if($rootScope.CartData.items.length==0)
			$rootScope.CartData.modelChanged=0;
		$rootScope.totAmntAfterRedeem=$rootScope.CartData.totalAmount=parseInt(totAmount);
		if(referEarnStart==1){
			$rootScope.getRedeemAmount();
			$rootScope.getCartTotAmnt();
		}
	}
	$rootScope.getCartTotAmnt=function(){
		var paramsToPass={};
		paramsToPass["reddemYes"]=$rootScope.reddemYes;
		var config={
			method: 'GET',
			url: redeemYesUrl,
			params: paramsToPass
		};
		$http(config).then(function successCallback(response) {
			//console.log(response);
		});
		if($rootScope.reddemYes)
			$rootScope.totAmntAfterRedeem=$rootScope.CartData.totalAmount-$rootScope.reddemablePoint;
		else
			$rootScope.totAmntAfterRedeem=$rootScope.CartData.totalAmount;
	}
	$rootScope.moengPremiumService=function(obj){
		Moengage.track_event("AddedPremiumService",{
			"product_name": obj.packageName, 
			"price": obj.amount,
			"Platform ": "web",                     
		});
	}
	$rootScope.addToCart=function(obj){
		if($rootScope.CartData.packages.indexOf(obj.packageId)==-1){
			var paramsToPass={};
			paramsToPass["packageId"]=obj.packageId;
			paramsToPass["packageName"]=obj.packageName;
			paramsToPass["totAmount"]=obj.totAmount;
			$http({
				url: cartAddUrl, 
				method: "GET",
				params: paramsToPass
			 });
			Moengage.track_event("AddedToCart",{
				"product_name": obj.packageName, 
				"price": obj.totAmount,
				"Platform ": "web",                     
			});
			$rootScope.CartData.items.push(paramsToPass);
			$rootScope.CartData.packages.push(obj.packageId);
			$rootScope.CalTotAmount(); 
		}
	};
	$rootScope.removeFromCart=function(obj,removeFrom){
		$rootScope.removeItem(obj,removeFrom);
		var paramsToPass={};
		Moengage.track_event("RemovedFromCart",{
			"product_name": obj.packageName, 
			"price": obj.totAmount,
			"Platform ": "web",                     
		});
		
		paramsToPass["id"]=parseInt(obj.packageId);
		$http({
			url: cartRemoveUrl, 
			method: "GET",
			params: paramsToPass
		});	
	};
	$rootScope.removeItem=function(obj,removeFrom){
		if(removeFrom=="dentPaint" || removeFrom=="wrapping"){
			var pId=parseInt(obj.packageId);
			var index;
			angular.forEach($rootScope.CartData.items, function(value, key) {
				if(value.packageId==obj.packageId){
					index=key;
				}
			});
		}else{
			var index = $rootScope.CartData.items.indexOf(obj);
		}
		$rootScope.CartData.items.splice(index,1);
		var index = $rootScope.CartData.packages.indexOf(parseInt(obj.packageId));
		$rootScope.CartData.packages.splice(index,1); 
		$rootScope.CalTotAmount();
	}
	$rootScope.removeAllCart=function(){
			angular.element('#remove_cart').modal('hide');
			$rootScope.CartData.items=[];
			$rootScope.CartData.packages=[];
			$rootScope.CartData.totalAmount=0;
			
			$http({
				url: cartRemoveAllUrl, 
				method: "GET",
			});
			$rootScope.reset();
	};
	
	
});
app.controller('referEarnCtrl', function($scope,$rootScope,$http) {
	$scope.getUserData=function(){
		if(referEarnStart==1){
		var config={
			method: 'GET',
			url: reUserDataUrl,
			headers: {
				'Authorization': $scope.getAuth()
			}
		};
		$http(config).then(function successCallback(response) {
			$scope.REdata=response.data.data;
			$rootScope.reddemAvailPoint=$scope.REdata.points;
			$scope.msg="Earn upto Rs3000 discount on car service & repairs. Download the Gaadizo app @ http://onelink.to/gaadizo and use the referral code "+$scope.REdata.referral_code+".";
			
		});
		}
	};
	//validateReferalCode=
	$scope.validateReferalCode=function(code){
		var config={
			method: 'GET',
			url: "http://api.vauchar.com/customers?referral_code="+code,
			headers: {
				'Authorization': $scope.getAuth()
			}
		};
		$http(config).then(function successCallback(response) {
			$scope.REdata=response.data.data[0];
		});
	};
	$scope.getAuth=function(){
		var username='72ec18ca-e77c-47f9-b35d-941cc807e592';
		var password='5183b5cf51143269333da242523701ff';
		return 'Basic ' + btoa(username + ":" + password)
	};
	$rootScope.getRedeemAmount=function(){
		if(referEarnStart==1 && $rootScope.CartData.items.length>0){
			var jsonData={};
			jsonData["transaction_value"]=$rootScope.CartData.totalAmount;
			jsonData["products"]={'sku':{}};
			angular.forEach($rootScope.CartData.items, function(value, key) {
				var mId=currentModelId;
				if(typeof(value.modelId)!='undefined')
					mId=value.modelId;
				var skuId=mId.toString()+value.packageId;
				jsonData["products"]["sku"][skuId]={"quantity" : 1};
			})
			var config={
				method: 'POST',
				url: reValidatePointsUrl,
				headers: {
					'Authorization': $scope.getAuth()
				},
				data:jsonData
			};
			$http(config).then(function successCallback(response) {
				$rootScope.reddemablePoint=response.data.allowed_redeemable_points;
				$rootScope.getCartTotAmnt();
			});
		}
	};
	$scope.facebookShare= function() {
		console.log('sssss');
		var url="www.gaadizo.com?vref="+$scope.REdata.referral_code;
		  var facebookWindow = window.open('https://www.facebook.com/sharer/sharer.php?t='+$scope.msg+'&u=' +url , 'facebook-popup', 'height=350,width=600');
		  if(facebookWindow.focus) { facebookWindow.focus(); }
			return false;
	}
	$scope.whatsUpShare= function() {
		var url="https://api.whatsapp.com/send?text=%20Earn%20upto%20Rs1000%20discount%20on%20car%20service%20%26%20repairs.%20Download%20the%20Gaadizo%20app%20%40%20http%3A%2F%2Fonelink.to%2Fgaadizoo%20and%20use%20the%20referral%20code%20"+$scope.REdata.referral_code;
		  var WhatsWindow = window.open(url, 'Whats-popup', 'height=350,width=600');
		  if(WhatsWindow.focus) { WhatsWindow.focus(); }
			return false;
	}
	$scope.copyCode= function() {
		/* Get the text field */
  var copyText = document.getElementById("refer_earn_code_id");
	console.log(copyText);
  /* Select the text field */
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand("Copy");
    $( "#refer_earn_code_success" ).fadeIn( 300 ).delay( 1500 ).fadeOut( 400 );
  /* Alert the copied text */
  //alert("Copied the text: " + copyText.value);
	}
	$scope.getUserData();
});
$("body").on("keyup", function(e){
    if (e.which === 27){
        return false;
    } 
});
$(".mob_number").on("keydown", function(e){
	return e.which == 69 || e.which == 107 ||  e.which == 109 ||  e.which == 110 ? false : true
});
$(".mob_number").on("input", function(e){
	var mVal=$(e.target).val();
	if (mVal.length > 10)
		$(e.target).val(mVal.slice(0,10));
}); 
function moengageSelectedModel(){
	Moengage.track_event("Selected Car",{
		"Model": $("#brand_id").select2('data')['0']['title'] 
	});
	Moengage.add_user_attribute("Selected Model",$("#brand_id").select2('data')['0']['text'] );
}
function matchCustom(params, data) {
    // If there are no search terms, return all of the data
    if ($.trim(params.term) === '') {
      return data;
    }

    // Do not display the item if there is no 'text' property
    if (typeof data.text === 'undefined') {
      return null;
    }

    // `params.term` should be the term that is used for searching
    // `data.text` is the text that is displayed for the data object
	var searchParam=params.term.toLowerCase();
	searchParam=searchParam.replace(/ /g,"");
	var modifiedData = $.extend({}, data, true);
	var reg=new RegExp("(^|.*\\s)"+searchParam+".*$");
	
    if (RegExp(reg, 'i').test(data.text)) {
		//modifiedData.text += ' (matched)';
		// You can return modified objects from here
		return modifiedData;
    }else{
		var child=[];
		$.each(modifiedData.children, function( index, value ) {
			var toTest=value.seo.replace(/-/g," ");
			//toTest=toTest.replace(/ /g,"");
			if (RegExp(reg, 'i').test(toTest)) {
 				child.push(value);
			}
			
		});
		if(child.length>0){
			modifiedData.children=child;
			return modifiedData;
		}
		return null;
	}
    // Return `null` if the term should not be displayed
    return null;
}
$.validate({scrollToTopOnError : false});
$.validate({
    form : '#subscribe-form,#mobile-link',
	scrollToTopOnError : false,
    onSuccess : function($form) {
	var url=$form.attr('data-url');
	var text_data=$form.attr('data-submit');
	var dataToPass=text_data+"="+$('#'+text_data).val();
	$.ajax({
        type: "get",
        url: url,
        cache: false,
        data: dataToPass,
        success: function(data) {
			if(data.status==1){
				$form.get(0).reset();
				$('#'+text_data+'_success').html(data.msg);
				setInterval(function(){
					$('#'+text_data+'_success').fadeOut(1500);
				}, 8000);
				
				
			}else if(data.status==0){
				$form.prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+data.msg+'</div>');
			}
        }
	});
    return false; // Will stop the submission of the form
    }
});
