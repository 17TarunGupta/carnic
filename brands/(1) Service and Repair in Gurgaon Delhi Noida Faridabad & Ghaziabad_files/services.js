function closepopup(){
    $.magnificPopup.close();
};
$.getJSON(brandModelUrl, function(result){
	var response=result;
	$("#brand_id").select2({
		data: response.data,
		matcher: matchCustom, 
		placeholder: "Select a Car",
		allowClear: true,
		dropdownParent: $("#car_select")
	});
});
var formActionUrl="";
var makeLogin;
$('#brand_id').on("select2:select", function(e) { 
	if(formActionUrl=="")
		formActionUrl=$(this).closest('form')[0].action
	$(this).closest('form')[0].action=formActionUrl+"/"+e.params.data.seo+"-car-service";
});
var scope;
app.controller('myCtrl', function($scope,$rootScope,$http) {
	$scope.packageData={};
	$scope.model_name="";
	$scope.manufacturer_name="";
	$rootScope.packageEnquiry=[];
	$rootScope.packageEnquiryName=[];
	$rootScope.promptEnqObj={};
	$rootScope.promptObj={};
	if(typeof loggedIn !== "undefined")
		$scope.loggedIn=loggedIn;
	
	$scope.dentOnOff=function(service,events){
		var obj=events.currentTarget;
		if(obj.checked){
			var to_add=$scope.validateAddToCart(service);
			if(to_add==false)
				obj.checked=false;
		}
		else
			$rootScope.removeFromCart(service,'dentPaint');
	}
	$scope.wrapOnOff=function(service,events){
		var obj=events.currentTarget;
		if(obj.checked){
			var to_add=$scope.validateEnquiry(service);
			if(to_add==false)
				obj.checked=false;
		}
		else
			$scope.removeEnquiry(service.packageId);
	}
	$scope.validateAddToCart=function(service){
		console.log(service);
		$rootScope.promptObj={};
		var serviceToRemove=[];
		var serviceNotToAdd=[];
		angular.forEach(service.to_be_removed, function(value, key) {
			if($rootScope.CartData.packages.indexOf(parseInt(value))!=-1){
				if($rootScope.servicesName[parseInt(value)])
					serviceToRemove.push($rootScope.servicesName[parseInt(value)]);
			}
		});
		$rootScope.cartValidationMsg="";
		$rootScope.cartContainsMsg="";
		var toAdd=1;
		if(serviceToRemove.length>0){
			var includes="includes";
			if(service.packageId==2)
				includes="is included in";
			$rootScope.cartValidationMsg="You have previously selected "+serviceToRemove+", Which "+includes+" "+service.packageName+". Do you want to remove "+serviceToRemove+" and add "+service.packageName;
			$('#prompt_for_cart').modal('show');
			$rootScope.promptObj=service;
			toAdd=0;
			return false;
		}else if(service.not_to_add.length>0){
			angular.forEach(service.not_to_add, function(value, key) {
				if($rootScope.CartData.packages.indexOf(parseInt(value))!=-1){
					if($rootScope.servicesName[parseInt(value)])
						serviceNotToAdd.push($rootScope.servicesName[parseInt(value)]);
				}
			});
			if(serviceNotToAdd.length>0){
				$rootScope.cartContainsMsg=serviceNotToAdd+" which you already added in cart include "+service.packageName;
				$('#contains_in_cart').modal('show');
				toAdd=1;
				return false;
			}
		}
		if(toAdd==1)
		$rootScope.addToCart(service);
		
	}
	$scope.validateEnquiry=function(service){
		$rootScope.promptEnqObj={};
		var serviceToRemove=[];
		var serviceNotToAdd=[];
		angular.forEach(service.to_be_removed, function(value, key) {
			if($rootScope.packageEnquiry.indexOf(parseInt(value))!=-1){
				if($rootScope.servicesName[parseInt(value)])
					serviceToRemove.push($rootScope.servicesName[parseInt(value)]);
			}
		});
		$rootScope.cartValidationMsg="";
		$rootScope.cartContainsMsg="";
		var toAdd=1;
		if(serviceToRemove.length>0){
			$rootScope.cartValidationMsg="You have previously selected "+serviceToRemove+", Which is includes "+service.packageName+". Do you want to remove "+serviceToRemove+" and add "+service.packageName;
			$('#prompt_for_cart').modal('show');
			$rootScope.promptEnqObj=service;
			toAdd=0;
			return false;
		}else if(service.not_to_add.length>0){
			angular.forEach(service.not_to_add, function(value, key) {
				if($rootScope.packageEnquiry.indexOf(parseInt(value))!=-1){
					if($rootScope.servicesName[parseInt(value)])
						serviceNotToAdd.push($rootScope.servicesName[parseInt(value)]);
				}
			});
			if(serviceNotToAdd.length>0){
				$rootScope.cartContainsMsg=serviceNotToAdd+" which you already added include "+service.packageName;
				$('#contains_in_cart').modal('show');
				toAdd=1;
				return false;
			}
		}
		if(toAdd==1)
			$scope.addEnquiry(service);
		
	}
	$scope.promptYes=function(){
		if($rootScope.promptEnqObj.packageId){
			angular.forEach($rootScope.promptEnqObj.to_be_removed, function(del_value, del_key) {
				$scope.removeEnquiry(del_value);
			});
			$scope.addEnquiry($rootScope.promptEnqObj);
		} else if($rootScope.promptObj.packageId){
			angular.forEach($rootScope.promptObj.to_be_removed, function(del_value, del_key) {
				angular.forEach($rootScope.CartData.items, function(value, key) {
					if(value.packageId==del_value){
						$rootScope.removeItem($rootScope.CartData.items[key]);
					}
				});
			});
			$rootScope.addToCart($rootScope.promptObj);
		}
		$('#prompt_for_cart').modal('hide');
		
	}
	$scope.getPackage=function(catId){
		if(typeof $scope.packageData[catId] === 'undefined'){
			var url=servicePackageUrl;
			if(catId==6)
				var url=dentPaintUrl;
			$http.get(url+"?categoryId="+catId).then(function(response) {
				var responsData=response.data;
				$scope.packageData[catId] = responsData.data.packages;
				$scope.model_name=responsData.data.model_name;
				$scope.manufacturer_name=responsData.data.manufacturer_name;
			});
		}
	}
	$scope.submitEnquiry=function(x){
		if(x)
			$scope.addEnquiry(x);
		if($rootScope.packageEnquiry.length==0){
			$('#enquiryErrorModal').modal("show");
			return false;
		}
		if($scope.loggedIn==0){
			openLoginModal();
			enquirysubmit=1;
			$('#myModal').modal({backdrop: 'static', keyboard: false, show: true});
			$scope.saveLoginEnquiry();
			return;
			
		}
		
		if($rootScope.packageEnquiry.length>0){
			$http.get(submitEnquiryUrl+"?service_id="+$rootScope.packageEnquiry).then(function(response) {
				var responsData=response.data;
			});
			$rootScope.packageEnquiry=[];
			$rootScope.showpackageEnquiryName=$rootScope.packageEnquiryName.toString();
			$rootScope.packageEnquiryName=[];
			console.log(enquirysubmit);
			if(enquirysubmit==1){
				$('#enquiryModal').modal({backdrop: 'static', keyboard: false, show: true});
			}else
				$('#enquiryModal').modal('show');
		}
	}
	$scope.addEnquiry=function(x){
		if($rootScope.packageEnquiry.indexOf(parseInt(x.packageId))==-1){
			$rootScope.packageEnquiry.push(x.packageId);
			$rootScope.packageEnquiryName.push(x.packageName);
		}
	}
	$scope.saveLoginEnquiry=function(){
		$http.get(submitEnquiryUrl+"?service_id="+$rootScope.packageEnquiry).then(function(response) {
				var responsData=response.data;
			});
	}
	
	$scope.removeEnquiry=function(packageId){
		var index = $rootScope.packageEnquiry.indexOf(parseInt(packageId));
		$rootScope.packageEnquiry.splice(index,1);
		$rootScope.packageEnquiryName.splice(index,1);
	}
	$scope.getPackage(defaultPackId);
	$http.get(serviceNameList).then(function(response) {
		$rootScope.servicesName=response.data;
	});
	makeLogin=function(){
		$('#myModal').modal("hide");
		$scope.loggedIn=1;
		loggedIn=1;
		if(enquirysubmit==1){
			$scope.submitEnquiry();
		}else
			window.location.reload();
	}
	makeLoginEnquiry=function($id,serviceName){
		var arr=$id.split(',');
		angular.forEach(arr, function(value, key) {
			var serId=parseInt(value);
			$rootScope.packageEnquiry.push(serId);
			
		});
		$rootScope.packageEnquiryName.push(serviceName);
		$scope.submitEnquiry(serviceName);
	}
	scope=$scope;
});
	
$(document).ready(function () {
	if(document.getElementById('horizontalTab')){
	$('#horizontalTab').easyResponsiveTabs({
		type: 'default', //Types: default, vertical, accordion           
		width: 'auto', //auto or any width like 600px
		fit: true,   // 100% fit in a container
		closed: 'accordion', // Start closed if in accordion view
		activate: function(event) { // Callback function if tab is switched
			var $tab = $(this);
			var $info = $('#tabInfo');
			var $name = $('span', $info);
			$name.text($tab.text());
			$info.show();
		}
	});
	}
});