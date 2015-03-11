
$( document ).ready(function() {

  videojs("example_video_1", {}, function(){

    // Set controls on - initially having it on was causing problems with the page loading size
    this.controls(true);

    // Player (this) is initialized and ready.
    this.on("ended",function(){

      // First get payment details for the modal dialog
      generatePaymentDetails();

      // Show the paywall modal dialog
      $('#myModal').modal();
    });

  });
});

function generatePaymentDetails(){
  var pubKey = 'tpubD6NzVbkrYhZ4XxRtduffgxdp8xyJ7DEXeffPYHbeWjMd65vMHkszWJzrFdW9PLCgTAAGw6J8ZAUNFfyEY8doUnGVbAySgjF2CQuewbk7bPk';
  var amount = '0.0001';

  $.ajax({
    type: "GET",
    url: "/api/v1/simple/payments?" +
      "publicKey=" + pubKey +
      "&amountRequested=" + amount,
    dataType: "json"
  })
  .done(function(res){

    console.log("Request Payment Address call complete");
    console.log(res);

    // Show the QR code
    $("#payment-qr-code").empty();
    $("#payment-qr-code").qrcode({width: 200,height: 200,text: res.result.paymentUrl });

    // Set the payment link href
    $("#payment-link").attr('href',res.result.paymentUrl);

    // Set the payment details - amount and paymentAddress
    $("#payment-details").html('<br /> BTC: ' + amount + '<br />Address: ' + res.result.paymentAddress);

    verifyPayment(res.result.paymentAddress);
  })
  .fail(function(data){
    console.log(data);
    $("#get-payment-response").text("Failed to request payment address");
    return;
  });
}

function verifyPayment(paymentAddress){

  $.ajax({
    type: "GET",
    url: "/api/v1/simple/payments/" + paymentAddress + "?timeout=30",
    dataType: "json"
  })
  .done(function(res){

    console.log("Verify Payment Address call complete");
    console.log(res);

    if(res.result.paid){

      console.log('Payment has been made.')

      // Show and start the full video since it was paid
      showFullVideo();

    }else{

      // Recursively call the check for payment until it's paid
      verifyPayment(paymentAddress);
    }

  })
  .fail(function(data){
    console.log(data);
    return;
  });
}

function showFullVideo(){
  $('#myModal').modal('hide');

  var myPlayer = videojs('example_video_1');
  myPlayer.off('ended');
  myPlayer.src('/videos/PatrickByrne_main.mp4');
  myPlayer.play();
}
