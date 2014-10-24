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
		data: { publicAddress : $("#register-address-input").val(),
				threshold: $("#register-threshold-input").val() },
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

	$("#get-payment-response").text("");

	$.ajax({
		type: "GET",
		url: "/api/v1/simple/payments?" +
			"publicAddress=" + $("#get-payment-address-input").val() +
			"&token=" + $("#get-payment-token-input").val() +
			"&amountRequested=" + $("#get-payment-amount-input").val(),
		dataType: "json"
	})
	.done(function(res){

		console.log("Request Payment Address call complete");
		console.log(res);

		$("#get-payment-response").text(JSON.stringify(res, null, 2));

		$("#qr-code").empty();
		$("#qr-code").qrcode({width: 128,height: 128,text: res.result.url });

	})
	.fail(function(data){
		console.log(data);
		$("#get-payment-response").text("Failed to request payment address");
		return;
	});
}

function verifyPayment(){

	$("#verify-payment-response").text("");

	$.ajax({
		type: "GET",
		url: "/api/v1/simple/payments/" + $("#verify-payment-input").val() +
				"?timeout=" + $("#verify-payment-timeout").val(),
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

function getHistory(){

	$("#get-history-response").text("");

	var page = $("#get-history-page-input").val();
	var count = $("#get-history-page-count-input").val();
	var token = $("#get-history-token-input").val();

	$.ajax({
		type: "GET",
		url: "/api/v1/simple/payments/" + $("#get-history-input").val() + "/history" + "?token=" + token +
			"&page=" + page + "&total=" + count,
		dataType: "json"
	})
	.done(function(res){

		console.log("Get payment history call complete");
		console.log(res);

		$("#get-history-response").text(JSON.stringify(res, null, 2));

	})
	.fail(function(data){
		console.log(data);
		$("#get-history-response").text("Failed to get payment history");
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

	$('#get-history-button').click(function() {
		console.log("get-history-button clicked.");
		getHistory();
	});

});
