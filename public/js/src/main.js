$(function() {
    $('table').tablesorter(); 
    $('th').removeClass('header');
    Pace.on('done', function() {
        $('#closeIntro').click(function(e) {
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
    });
    // enable vibration support
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    loadImages();
    hammerSetup();
    buildStore();
    BindButtons.bindAll();
    setWindowResizeProperties()
    bottomNavCenter();
    setUpSocketListeners();
    scene.load(level, ctxB, zoom);
    backgroundOffset = { x: -2929.1425191861085, y: -8798.232238003477 };
    zoom = 0.045;
    window.requestAnimationFrame(drawFrame);
    window.requestAnimationFrame(function() { drawScoreBar(scores) });
});

function drawScoreBar(scores) {
    ctxI.clearRect(0, 0, canvasWidth, canvasHeight);
    var orangePoints = scores.orange;
    var bluePoints = scores.blue;
    var maxPoints = 1000;
    var sizeOfBar = .5 - ($('#playerGold span').offset().left) / canvasWidth;
    var swordHeight = $('#sword span').height();
    var swordWidth = $('#sword span').width();
    var swordCenter = { y: $('#sword span').offset().top + swordHeight / 2, x: $('#sword span').offset().left + swordWidth / 2 };
    ctxI.fillStyle = 'orange';
    var leftSide = (.5 - sizeOfBar) * canvasWidth + sizeOfBar * canvasWidth * (1 - orangePoints / maxPoints);
    ctxI.fillRect(leftSide, swordCenter.y, swordCenter.x - leftSide, swordHeight / 7);
    ctxI.fillStyle = 'blue';
    rightWidth = sizeOfBar * canvasWidth * (bluePoints / maxPoints)
    ctxI.fillRect(swordCenter.x, swordCenter.y, rightWidth, swordHeight / 7);
}

function buildStore() {
    var count = 0;
    var top = false;
    var bottom = false;
    for (var entity in entityInfo) {
        if (!top && count % 3 === 0) {
            $('#shop').append('<div id="cards' + count / 3 + '" class="card-deck">');
            top = true;
        }
        if (entityInfo[entity].image) {
            var id = ~~(count / 3)
            $('#cards' + id).append('<div class="card text-xs-center" id = ' + entity + '><img class="card-img-top" src="' + entityInfo[entity].image + '" alt="Card image cap"><div class="card-block text-xs-center"><h4 class="card-title">' + entityInfo[entity].name + '</h4><p class="card-text"></p><p class="card-text"><small class="text-muted">' + entityInfo[entity].cost + ' Gold Pieces</p><button type="button" class="btn btn-success buy">Buy</button></div>')
            count++;
            top = false;
            bottom = false;
        }
    }
}

function setBackgroundOffsetToScreenPoint(sx, sy, z1, z2) {
    var mapPoint = convertScreenToMapPoint(sx, sy, z1);
    backgroundOffset.x = (sx - mapPoint.x * z2) / z2;
    backgroundOffset.y = (sy - mapPoint.y * z2) / z2;
}

function zoomAction(e) {
    var scale = e.scale;
    var oldZoom = zoom;
    if (scale > 1) {
        scale = 1 - (1 - scale) * zoomSpeed // .9 becomes .95, 1.1 becomes 1.05
    } else {
        scale = 1 - (1 - scale) * zoomSpeed * 2
    }
    zoom *= scale;
    while (levelWidth * size * zoom < $('#gameContainer').width() || levelHeight * size * zoom < $('#gameContainer').height()) {
        zoom += 0.001
    }
    if (zoom > 3) {
        zoom = 3;
    }
    setBackgroundOffsetToScreenPoint(e.center.x, e.center.y, oldZoom, zoom);
    limitBackgroundOffset();
    redrawBackground();
}

function bottomNavCenter() {
    var leftMargin = canvasWidth * .5 - $('#allEntities').outerWidth() / 2 - $('#previousEntity').outerWidth() - $('nav').css('padding-right').slice(0, -2);
    $('#allEntities').css({ marginLeft: leftMargin });
    leftMargin = canvasWidth * .5 - $('#sword').outerWidth() / 2 - $('nav').css('padding-right').slice(0, -2);
    $('#sword').css({ marginLeft: leftMargin });
    $('#topNav nav').css({ marginTop: $('#sword span').height() })
}
var efps = 15;

function drawFrame() {
    var now = Date.now();
    limitBackgroundOffset();
    if (Date.now() > lastAnimation + 1000 / animationPerSecond || serverSentFullState) {
        lastAnimation = Date.now();
        serverSentFullState = false;
        for (var e in entities) {
            if (isInWindow(entities[e].x, entities[e].y)) {
                animateEntity(entities[e], entities);
            }
        }
    }
    if (entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight) {
        drawEntities(entities, ctxF, true);
    }
    setTimeout(function() {
        window.requestAnimationFrame(drawFrame);
    }, Math.max(now - Date.now() + 1000 / efps, 0))
}

function redrawBackground() {
    scene.load(level, ctxB, zoom); //drawing all layers, could flatten, bug
    if (entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight) {
        drawEntities(entities, ctxF, true);
    }
}

function loadImages() {
    //  http://res.cloudinary.com/ochemaster/image/upload/w_241,c_scale/v1475040587/orcPeonStore_dp53w5.png
    //Load up entity images
    for (var entity in entityInfo) {
        if (entityInfo[entity].image) {
            entityInfo[entity].image = 'https://res.cloudinary.com/ochemaster/image/upload/h_230,c_scale/v1477430979/' + entityInfo[entity].image;
            var teams = ['orange', 'blue'];
            for (var t in teams) {
                characterImages[entity + '_' + teams[t]] = new Image();
                characterImages[entity + '_' + teams[t]].src = 'img/characters/' + entity + '/' + entity + '_' + teams[t] + '.png';
                characterImages[entity + 'Pose' + '_' + teams[t]] = new Image();
                characterImages[entity + 'Pose' + '_' + teams[t]].src = 'img/characters/' + entity + '/' + entity + 'Pose' + '_' + teams[t] + '.png';
            }
        }
        characterImages[entity] = new Image();
        characterImages[entity].src = 'img/characters/' + entity + '/' + entity + '.png';
        characterImages[entity + 'Pose'] = new Image();
        characterImages[entity + 'Pose'].src = 'img/characters/' + entity + '/' + entity + 'Pose' + '.png';
    }
}
function createSortTable(){
    $('tbody').empty();
    var playerInfoArray = [];
    for(var p in allPlayerInfo){
        if(!allPlayerInfo[p].name){
            continue;
        }
        allPlayerInfo[p].score = allPlayerInfo[p].aiKills * .5 + allPlayerInfo[p].kills - allPlayerInfo[p].deaths * .5 + allPlayerInfo[p].captures * 2;
        playerInfoArray.push(allPlayerInfo[p]);
    }
    playerInfoArray.sort(comparePlayers);
    for(var p in playerInfoArray){
        var rowColor = "table-danger";
        if(playerInfoArray[p].team === 'blue'){
            rowColor = 'table-info';
        }
        var ratio = playerInfoArray[p].kills / playerInfoArray[p].deaths;
        if(isNaN(ratio)){
            ratio = 0;
        }
        ratio = Math.round(ratio * 100) / 100;

        $('tbody').append('<tr class="' + rowColor + '"><th scope="row">' + playerInfoArray[p].score + '</th><td>' + playerInfoArray[p].name + '</td><td>' + playerInfoArray[p].captures + '</td><td>' + playerInfoArray[p].kills + '</td><td>' + ratio + '</td></tr>')

    }
    
    //$("table").tablesorter( {sortList: [[0,0]]});
    //$('th').removeClass('header');
}
function comparePlayers(a, b){
    return b.score - a.score;
}