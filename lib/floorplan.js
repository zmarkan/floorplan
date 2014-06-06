var Floorplan = function (dataSource) {
  var data;

  var initialize = function () {
    data = getData();
  };

  this.render = function (canvasId) {
    var canvas = $("#" + canvasId)[0];

    canvas.width = data.width;
    canvas.height = data.height;

    $.each(data.polygons, function (_, polygon) {
      renderPolygon(polygon, canvas);
    });
  };

  var renderPolygon = function (polygon, canvas) {
    var context = canvas.getContext("2d");

    context.beginPath();
    context.fillStyle = polygon.color;

    var startPoint = polygon.points[0];
    context.moveTo(startPoint.x, startPoint.y);

    $.each(polygon.points, function (_, point) {
      context.lineTo(point.x, point.y);
    });

    context.lineTo(startPoint.x, startPoint.y);

    context.closePath();
    context.fill();
  };

  var getData = function () {
    $.ajaxSetup({ async: false });

    var returnData;
    $.getJSON(dataSource, function (data) {
      returnData = data;
    });

    return returnData;
  };

  initialize();
};
