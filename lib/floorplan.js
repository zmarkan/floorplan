var Floorplan = function (dataSource) {
  var data;

  var initialize = function () {
    data = getData();
  };

  this.render = function (canvasId) {
    var canvas = $("#" + canvasId)[0];
    var context = canvas.getContext("2d");

    var image = new Image();

    image.onload = function () {
      canvas.width = image.width;
      canvas.height = image.height;

      context.drawImage(image, 0, 0);

      debug();
    };

    canvas.onclick = canvasClick;

    image.src = "data/" + data.image;
  };

  var debug = function () {
    $.each(data.objects, function (_, object) {
      var color = "green";
      if (object.type === "floor") {
        color = "gray";
      }
      else if (object.type === "person") {
        color = "red";
      }

      renderPolygon(object, color);
    });
  };

  var renderPolygon = function (object, color) {
    var points = $.map(object.points, function (point, _) {
      return canvasCoords(point);
    });

    var context = canvas.getContext("2d");
    context.beginPath();
    context.fillStyle = color;
    context.globalAlpha = 0.3;

    if (points.length === 1) {
      var point = points[0];
      context.globalAlpha = 1;
      context.arc(point.x,point.y,object.radius,0,2*Math.PI);
    }
    else {
      var startPoint = points[0];
      context.moveTo(startPoint.x, startPoint.y);

      $.each(points, function (_, point) {
        context.lineTo(point.x, point.y);
      });

      context.lineTo(startPoint.x, startPoint.y);
    }

    context.closePath();
    context.fill();
  };

  var objects = function (point) {
    var array = [];

    $.each(data.objects, function (_, object) {
      if (inside(point, object)) {
        array.push(object);
      }
    });

    return array;
  };

  var inside = function (point, object) {
    var inside = false;

    if (object.points.length === 1) {
      var x1 = point.x;
      var y1 = point.y;

      var x2 = object.points[0].x;
      var y2 = object.points[0].y;

      var xSquared = Math.pow((x1 - x2), 2);
      var ySquared = Math.pow((y1 - y2), 2);

      var distance = Math.sqrt(xSquared + ySquared);

      inside = distance < object.radius;
    }
    else {
      var x = point.x;
      var y = point.y;
      
      for (var i = 0, j = object.points.length - 1; i < object.points.length; j = i++) {
        var xi = object.points[i].x;
        var yi = object.points[i].y;

        var xj = object.points[j].x;
        var yj = object.points[j].y;
        
        var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
    }

    return inside;
  };

  var getData = function () {
    $.ajaxSetup({ async: false });

    var returnData;
    $.getJSON(dataSource, function (data) {
      returnData = data;
    });

    return returnData;
  };

  var canvasClick = function (event) {
    var coords = getCursorPosition(event, canvas);
    var dCoords = dataCoords(coords);

    var x = dCoords.x;
    var y = dCoords.y;

    var clickedObjects = objects({ x: x, y: y});

    console.log("x: ", x, " y: ", y);
    console.log(clickedObjects)
    console.log("-----")
  };

  var canvasCoords = function (point) {
    var x = point.x * canvas.width / data.width;
    var y = point.y * canvas.height / data.height;

    return {x: x, y: y};
  };

  var dataCoords = function (point) {
    var x = point.x / canvas.width * data.width;
    var y = point.y / canvas.height * data.height;

    return {x: x, y: y};
  };

  var getCursorPosition = function (e, canvas) {
    var x;
    var y;

    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    }
    else {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return [x, y];
  }

  initialize();
};
