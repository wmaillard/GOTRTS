 Pace.on('done', function() {
        $('#closeIntro').click(function(e) {
            if($('#skipTutorial').is(':checked')){
                for(var i in firstTime){
                    firstTime[i] = false;
                }
            }else{
                    $('#showShop').addClass('breathing');
            }
            if ($('#screenName').val() === "") {
                $("#screenName").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
            } else {
                name = $('#screenName').val();
                socket.emit('name', name);
                $('#startInfo').toggle();
                $('#introTeamBox').toggle();
                setTimeout(function() {
                    $('#introTeamBox').fadeOut('slow');
                }, 1000)
            };
        });
        $('#closeIntro').removeClass('disabled');
       if(playerTeam === 'blue'){
             //cacheMapTiles()
             zoomPanTo(castles[1].x, castles[1].y)
            
        }else if(playerTeam === 'orange'){
            //cacheMapTiles(true);
            zoomPanTo(castles[4].x, castles[4].y)
        }
    });
    function runTips(i) {
    if ($('#startInfo').is(":visible")) {
        setTimeout(function() {
            $('#didYouKnow').fadeTo('slow', .01, function() {
                $('#didYouKnow').text(tips[i]);
                $('#didYouKnow').fadeTo( 'slow', 1);
                i++;
                i %= tips.length;
                runTips(i);
            })
        }, 3000);
    }
}
runTips(0)
