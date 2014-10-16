var bitcore = require('bitcore');

var bitcoinNetwork = bitcore.networks['testnet'];

function generateRandomAddress(){

	var password = Math.random().toString(10);
	var privateKey = bitcore.util.sha256(password);

	var key = new bitcore.Key();
	key.private = privateKey;
	key.regenerateSync();

	var hash = bitcore.util.sha256ripe160(key.public);
	var version = bitcoinNetwork.addressVersion;

	var addr = new bitcore.Address(version, hash);

	$("#random-address").text(addr);

}

function registerAddress(){

	$.ajax({
		type: "POST",
		url: "/api/v1/simple/addresses",
		data: { publicAddress : $("#register-address-input").val() },
		dataType: "json"
	})
	.done(function(res){

		console.log("Register Address call complete");
		console.log(res);

		$("#register-response").text(JSON.stringify(res, null, 2));

	})
	.fail(function(data){
		console.log(data);
		$("#register-response").text("Failed to post address registration request");
		return;
	});
}

function requestPaymentAddress(){
		$.ajax({
		type: "GET",
		url: "/api/v1/simple/payments?publicAddress=" + $("#get-payment-address-input").val(),
		dataType: "json"
	})
	.done(function(res){

		console.log("Request Payment Address call complete");
		console.log(res);

		$("#get-payment-response").text(JSON.stringify(res, null, 2));

		$("#qr-code").empty();
		$("#qr-code").qrcode({width: 96,height: 96,text: res.result.paymentAddress });

	})
	.fail(function(data){
		console.log(data);
		$("#get-payment-response").text("Failed to request payment address");
		return;
	});
}

function verifyPayment(){
		$.ajax({
		type: "GET",
		url: "/api/v1/simple/payments/" + $("#verify-payment-input").val() +
				"?amount=" + $("#verify-payment-amount").val() +
				"&timeout=" + $("#verify-payment-timeout").val(),
		dataType: "json"
	})
	.done(function(res){

		console.log("Verify Payment Address call complete");
		console.log(res);

		$("#verify-payment-response").text(JSON.stringify(res, null, 2));

	})
	.fail(function(data){
		console.log(data);
		$("#verify-payment-response").text("Failed to request verify payment");
		return;
	});
}

$( document ).ready(function() {

	generateRandomAddress();

	$('#register-address-button').click(function() {
		console.log("register-address-button clicked.");
		registerAddress();
	});

	$('#get-payment-address-button').click(function() {
		console.log("get-payment-address-button clicked.");
		requestPaymentAddress();
	});

	$('#verify-payment-button').click(function() {
		console.log("verify-payment-button clicked.");
		verifyPayment();
	});

});
