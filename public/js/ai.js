//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);



var AI = {
  //A* tutorial: http://www.policyalmanac.org/games/aStarTutorial.html
  //https://en.wikipedia.org/wiki/A*_search_algorithm
  //10 points for adjacent node 14 for diagonal

  //cNode.x, cNode.y, eNode.x, eNode.y, blockingTerrain (true && undefined is blocking)
  drawTestDots: function(current, end, blockingTerrain, ctx){
    var path;
    if(!this.terrainArray){

      current.GScore = 0;

      var t0 = performance.now();

      path = this.AStar(current, end, blockingTerrain);

      this.terrainArray[end.x][end.y].color = 'lime'
      this.terrainArray[5][5].val = 'selected';

      var t1 = performance.now();
      console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")

      
    }
    ctx.clearRect(0, 0, ctxI.canvas.width, ctxI.canvas.height);
    for(var i = 0; i < this.terrainArray.length; i++){
      for(var j = 0; j < this.terrainArray[i].length; j++){
        var color;
        if(this.terrainArray[i][j].color){
          color = this.terrainArray[i][j].color;
        }
        else if(this.terrainArray[i][j].val === true || this.terrainArray[i][j].val === undefined){
          color = 'red';
        }else if(this.terrainArray[i][j].val === 'wall'){
          color = 'lightblue'
        }
        else if(this.terrainArray[i][j].val === 'baseN'){
          color = 'blue'
        }
        else if(this.terrainArray[i][j].val === 'baseS'){
          color = 'violet'
        }
        else if(this.terrainArray[i][j].val === 'selected'){
          color = 'deepPink'
        }
        else{
          color = 'green';
        }
        var x = ~~((i ) * 32 + 16 + backgroundOffset.x);
        var y = ~~((j )) * 32 + 16 + backgroundOffset.y;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
      }
    }
    return path;
  },
  copyBlockingTerrain: function(blockingTerrain){
    this.terrainArray = JSON.parse(JSON.stringify(blockingTerrain));
    for(var i = 0; i < this.terrainArray.length; i++){
      for(var j = 0; j < this.terrainArray[i].length; j++){
        var val = this.terrainArray[i][j];
        this.terrainArray[i][j] = {};
        this.terrainArray[i][j].val = val;

      }
    }

  },
  AStar: function(startNode, eNode, blockingTerrain){  //This takes about  6 ms right now, pretty good!
    this.copyBlockingTerrain(blockingTerrain);
    this.closedSet = [];
    this.openSet = [];
    var cNode = startNode;
    cNode.GScore = 0;
    cNode.HScore = this.calcHScore(cNode, eNode);
    cNode.FScore = startNode.GScore + cNode.HScore;
    this.openSet.push(cNode);



    do{
      cNode = this.getLowestFScore(this.openSet);
      this.addNonBlockedNeighborsToOpen(cNode, eNode);
      var index = this.findInArray(cNode, this.openSet);

      if(index === -1){
        console.log('did not find cNode in openSet')
        break;
      }
      this.openSet.splice(index, 1); //get rid of cNode
      this.closedSet.push(cNode);

      if(cNode.x === eNode.x && cNode.y === eNode.y){
        console.log('found end');
        var path = this.drawPath(cNode, startNode);
        return path;
      }

    }while(this.openSet.length > 0)





  },
  drawPath(cNode, startNode){
    var path = [];
    var endNode = cNode;
    do{
      var coords = {};
      coords.x = cNode.x;
      coords.y = cNode.y;
      path.push(coords);
      this.terrainArray[cNode.x][cNode.y].color = 'yellow';
    }while(cNode = cNode.parent)
    this.terrainArray[startNode.x][startNode.y].color = 'black';
    this.terrainArray[endNode.x][endNode.y].color = 'black';
    return path;
  },
  addNonBlockedNeighborsToOpen: function(cNode, eNode){
    for(var i = 0; i < 8; i++){
      var nextNode = this.getNextNodeCoords(cNode, i);
      if(this.checkIfFree(nextNode) && this.findInArray(nextNode, this.closedSet) === -1){

        this.terrainArray[nextNode.x][nextNode.y].color = 'blue';
        nextNode.parent = cNode;
        this.setScores(nextNode, eNode, i);

        var index = this.findInArray(nextNode, this.openSet); 
        if(index !== -1){
          if(this.openSet[index].GScore > nextNode.GScore){
            this.openSet[index].GScore = nextNode.GScore;
            this.openSet[index].FScore = this.openSet[index].GScore + this.openSet[index].HScore
            this.openSet[index].parent = cNode;

          }
        }
        else{
          this.openSet.push(nextNode);  //Change this to a priority queue at some point
        }

      }
    }
  },
  setScores: function(nextNode, eNode, neighborNum){
    nextNode.GScore = this.calcGScore(nextNode, neighborNum);
    nextNode.HScore = this.calcHScore(nextNode, eNode);
    nextNode.FScore = nextNode.GScore + nextNode.HScore;
  },
  findInArray: function(item, array){
    for(var i = 0; i < array.length; i++){
      if(array[i].x === item.x && array[i].y === item.y){
        return i;
      }
    }
    return -1;
  },
  getLowestFScore: function(set){
    var lowest = {};
    lowest.FScore = Number.MAX_SAFE_INTEGER;
    for(var i = 0; i < set.length; i++){
      if(set[i].FScore < lowest.FScore){
        lowest = set[i];
      }
    }
    return lowest;
  },


  calcHScore: function(nextCoords, eNode){
    //diagonal distance no weight from here: http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
    
    //return Math.max(Math.abs(nextCoords.x - eNode.x), Math.abs(nextCoords.y - eNode.y));

    //Manhattan method
    //return Math.abs(eNode.x - nextCoords.x) + Math.abs(eNode.y - nextCoords.y);

    //diagonal distance
    var d_max = Math.max(Math.abs(nextCoords.x - eNode.x), Math.abs(nextCoords.y - eNode.y));
    var d_min = Math.min(Math.abs(nextCoords.x - eNode.x), Math.abs(nextCoords.y - eNode.y));
    var c_n = 10;
    var c_d = c_n * 1.4141;
    return c_d * d_min + c_n * (d_max - d_min);
  },
  calcGScore: function(nextNode, neighborNum){ //next node is the number 0-7
 /*   if(neighborNum === 0 || neighborNum === 2 || neighborNum === 5 || neighborNum === 7){
      return 14 + nextNode.parent.GScore;
    }
    else return 10 + nextNode.parent.GScore;*/
    return 1 + nextNode.parent.GScore;
  },
  /*nextNode is like this:

    0   1   2
    3  cur  4
    5   6   7 */
  checkIfFree: function(nextCoords){
    var nodeValue;
    if(this.terrainArray[nextCoords.x] === undefined || this.terrainArray[nextCoords.x][nextCoords.y] === undefined){
      nodeValue = undefined;
    }
    else{
      nodeValue = this.terrainArray[nextCoords.x][nextCoords.y].val;
    }
    if(nodeValue === true || nodeValue === undefined){
      return false;
    }
    else return true;

  },
  getNextNodeCoords: function(cNode, nextNode){
    var nextCoords = {};
    switch(nextNode){
      case 0:
        nextCoords = this.changeNextNodeCoords(cNode, -1, -1);
        break;
      case 1: 
        nextCoords = this.changeNextNodeCoords(cNode, 0, -1);
        break;
      case 2:
        nextCoords = this.changeNextNodeCoords(cNode, 1, -1);
        break;
      case 3:
        nextCoords = this.changeNextNodeCoords(cNode, -1, 0);
        break;
      case 4:
        nextCoords = this.changeNextNodeCoords(cNode, 1, 0);
        break;
      case 5:
        nextCoords = this.changeNextNodeCoords(cNode, -1, 1);
        break;
      case 6:
        nextCoords = this.changeNextNodeCoords(cNode, 0, 1);
        break;
      case 7:
        nextCoords = this.changeNextNodeCoords(cNode, 1, 1);
        break;

    }
    return nextCoords;

  },
  changeNextNodeCoords(cNode, dx, dy){
    var nextCoords = {};
    nextCoords.x = cNode.x + dx;
    nextCoords.y = cNode.y + dy;
    return nextCoords;
  }




}
function travelSouth(entity) {

    if(!entity.intervalSet){
      entity.intervalSet = true;
      setInterval(function() {
        if(entity.walking === true){
          if(!entity.nextNode){
            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
            if(entity.path.length === 0 ){
              entity.x = entity.heading.x;
              entity.y = entity.heading.y;
              entity.walking = false;
            }
          }else if(entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32)){
            if(~~(entity.x / 32) > entity.nextNode.x){
              entity.x -= 10;
            }else if (~~(entity.x / 32) < entity.nextNode.x){
              entity.x += 10;
            }
            if(~~(entity.y / 32) > entity.nextNode.y){
              entity.y -= 10;
            }else if(~~(entity.y / 32) < entity.nextNode.y){
              entity.y += 10
            }
          }else{

            entity.nextNode = entity.path.pop();

          }
      }
           /*   if (shouldGoThere(entity.x, entity.y + 5, entity)) {
                  addAlreadyBeen(entity);
                  entity.y += 5;
                  entity.directionPointing = 'S';

              } else if (shouldGoThere(entity.x + 5, entity.y, entity)) {
                  addAlreadyBeen(entity);
                  entity.x += 5;
                  entity.directionPointing = 'E';
              } else if (shouldGoThere(entity.x, entity.y - 5, entity)) {
                  addAlreadyBeen(entity);
                  entity.y -= 5;
                  entity.directionPointing = 'N';
              } else if (shouldGoThere(entity.x - 5, entity.y, entity)) {
                  addAlreadyBeen(entity);
                  entity.x -= 5;
                  entity.directionPointing = 'W';
              }*/

          
      }, 250)
  }
}
    
    


function addAlreadyBeen(entity) {
    if (!entity.alreadyBeen[entity.x]) {
        entity.alreadyBeen[entity.x] = [];
    }
    entity.alreadyBeen[entity.x][entity.y] = true;
}

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 18, y) === true || isBlocked(x, y + 18) === true || isBlocked(x + 18, y + 18) === true) {
        return true;
    }else if(isBlocked(x, y) === undefined || isBlocked(x + 32, y) === undefined || isBlocked(x, y + 32) === undefined || isBlocked(x + 32, y + 32) === undefined){
        return true;
    }else return false;
}

function shouldGoThere(x, y, entity) {
    return (entityIsBlocked(x, y) !== true && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
}

