$( document ).ready(function() {

  // Iterate over the items that have payment required
  $( ".payment-required" ).each(function() {

    // Make them hidden
    $( this ).addClass( "hidden-box" );

    generatePaymentDetails(this);
  });
});


function generatePaymentDetails(div){
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

    $(div).after("<div id=\"payment-" + res.result.paymentAddress + "\" class=\"well well-lg text-center\"><p>See the rest of the article by paying " +
      amount +
      " BTC</p>" +
      "<div id=\"qr-code-" + res.result.paymentAddress + "\" ></div>" +
      "<p>" +  res.result.paymentAddress + "</p>" +
      "</div>");

    $("#qr-code-" + res.result.paymentAddress).empty();
    $("#qr-code-" + res.result.paymentAddress).qrcode({width: 192,height: 192,text: "bitcoin:" + res.result.paymentAddress+ "?amount=" + amount});

    verifyPayment(res.result.paymentAddress, div);
  })
  .fail(function(data){
    console.log(data);
    $("#get-payment-response").text("Failed to request payment address");
    return;
  });
}

function verifyPayment(paymentAddress, div){

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

      // remove the hidden box css
      $(div).removeClass("hidden-box");

      // remove the payment box
      $("#payment-" + res.result.paymentAddress).remove();

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
