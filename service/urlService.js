
function UrlService(){

}

UrlService.prototype.generatePaymentUrl = function(addressString, amount){

   return "bitcoin:" + addressString + "?amount=" + amount + "&gateway=microtrx.com";
};

module.exports = UrlService;
