
$( document ).ready(function() {


  videojs("example_video_1", {}, function(){
    // Player (this) is initialized and ready.
    this.on("ended",function(){
      // When the player ends, show the paywall
      
    });

  });
});
