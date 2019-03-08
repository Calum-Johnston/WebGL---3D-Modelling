// HelloTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' + //Coordinates
    '  gl_PointSize = a_PointSize;\n' +  // Point Size
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +  // Point Color
    '}\n';




function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
	
	  // Get the storage location of attribute variables (VERTEX SHADER)
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	  if(a_Position < 0){
		  console.log('Failed to get the storage location of a_Position');
    }
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if(a_PointSize < 0){
      console.log('Failed to get the storage location of a_PointSize');
    }

    // Get the storage location of attribute variables (FRAGMENT SHADER)
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(u_FragColor < 0){
      console.log('FAiled to get the storage location of u_FragColor');
    }

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position, u_FragColor);};
	
	  // Pass vertex position & point size to attribute variables
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.vertexAttrib1f(a_PointSize, 10.0);
	
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_points = []; // The array to store the position of a point
var g_colors = []; // The array to store the color of a point

function click(ev, gl, canvas, a_Position, u_FragColor){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  // Transform coordinates from the browser area to canvas (rect.x)
  // then transforms into coordinates WebGL understands (canvas.x)
  x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
  y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

  // Stores the coordinates to g_points array
  g_points.push([x,y]);

  // Stores the color to g_colors array
  if(x >= 0.0 && y >= 0.0){
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  //Red
  } else if(x < 0.0 && y < 0.0){
    g_colors.push([0.0, 255.0, 0.0, 1.0]);  //Green
  } else if(x < 0.0 && y >= 0.0){
    g_colors.push([0.0, 0.0, 1.0, 1.0]);  //Blue
  } else{
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  //Red
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length
  for(var i = 0; i < len; i++){
    var xy = g_points[i];
    var rgba = g_colors[i];

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}


