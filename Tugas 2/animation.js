"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var colorLocation = gl.getAttribLocation(program, "a_color");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  // Create a buffer to put colors in
  var colorBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // Put geometry data into buffer
  setColors(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var translation = [0, 0, -360];
  var rotation = [degToRad(190), degToRad(40), degToRad(320)];
  var scale = [1, 1, 1];
  var fieldOfViewRadians = degToRad(60);
  var rotationSpeed = 1.2;

  var then = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(now) {
    // Convert to seconds
    now *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = now - then;
    // Remember the current time for the next frame.
    then = now;

    // Every frame increase the rotation a little.
    rotation[1] += rotationSpeed * deltaTime;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Turn on the color attribute
    gl.enableVertexAttribArray(colorLocation);

    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 3;                 // 3 components per iteration
    var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(
        colorLocation, size, type, normalize, stride, offset);

    // Compute the matrices
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var matrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);

    // Call drawScene again next frame
    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0,   0,  0,
        0, 150,  0,
        30,   0,  0,
        0, 150,  0,
        30, 150,  0,
        30,   0,  0,

        // top rung front
        30,   0,  0,
        30,  30,  0,
        70,   0,  0,
        30,  30,  0,
        70,  30,  0,
        70,   0,  0,

        // right column front
        70,  50,  0,
        70,  100,  0,
        100,  50,  0,
        70,  100,  0,
        100,  100,  0,
        100,  50,  0,

        // top diagonal front
        50,  30,  0,
        70,  60,  0,
        70,  30,  0,
        70,   0,  0,
        70,  50,  0,
        100,  50,  0,

        // bottom diagonal front
        50,  120,  0,
        70,  120,  0,
        70,  90,  0,
        70,  100,  0,
        70,   150,  0,
        100,  100,  0,

        // bottom rung front
        30,  120,  0,
        30,  150,  0,
        70,  150,  0,
        70,  120,  0,
        30,  120,  0,
        70,  150,  0,      

        // left column back
        0,   0,  30,
        30,   0,  30,
        0, 150,  30,
        0, 150,  30,
        30,   0,  30,
        30, 150,  30,

        // top rung back
        30,   0,  30,
        70,   0,  30,
        30,  30,  30,
        30,  30,  30,
        70,   0,  30,
        70,  30,  30,

        // right column back
        70,  50,  30,
        100,  50,  30,
        70,  100,  30,
        70,  100,  30,
        100,  50,  30,
        100,  100,  30,

        
        // top diagonal back
        70,  60,  30,
        50,  30,  30,
        70,  30,  30,
        70,  50,  30,
        70,   0,  30,
        100,  50,  30,

        // bottom diagonal back
        70,  120,  30,
        50,  120,  30,
        70,  90,  30,
        70,   150,  30,
        70,  100,  30,
        100,  100,  30,

        // bottom rung back
        30,  150,  30,
        30,  120,  30,
        70,  150,  30,
        30,  120,  30,
        70,  120,  30,
        70,  150,  30,    

        // top
        0,   0,   0,
        70,   0,   0,
        70,   0,  30,
        0,   0,   0,
        70,   0,  30,
        0,   0,  30,

        // top diagonal right
        70,   0,   0,
        100,  50,   0,
        100,  50,  30,
        70,   0,   0,
        100,  50,  30,
        70,   0,  30,

        // bottom diagonal right
        100,  100,   0,
        70,   150,   0,
        100,  100,  30,
        100,  100,  30,
        70,   150,   0,
        70,   150,  30,

        // under top rung
        30,   30,   0,
        30,   30,  30,
        50,  30,  30,
        30,   30,   0,
        50,  30,  30,
        50,  30,   0,

        // top of bottom rung
        30,   120,   0,
        50,   120,  30,
        30,   120,  30,
        30,   120,   0,
        50,   120,   0,
        50,   120,  30,

        // right of right column
        100,   50,   0,
        100,   100,  30,
        100,   50,   30,
        100,   50,   0,
        100,   100,   0,
        100,   100,  30,

        // right of left column
        30,   30,   0,
        30,  120,  30,
        30,   30,  30,
        30,   30,   0,
        30,  120,   0,
        30,  120,  30,

        // bottom
        0,   150,   0,
        0,   150,  30,
        70,  150,  30,
        0,   150,   0,
        70,  150,  30,
        70,  150,   0,

        // left of left column
        0,   0,   0,
        0,   0,  30,
        0, 150,  30,
        0,   0,   0,
        0, 150,  30,
        0, 150,   0,

        // left of right column
        70,   60,   0,
        70,   60,  30,
        70,   90,  30,
        70,   60,   0,
        70,   90,  30,
        70,   90,   0,        
                
        // top diagonal left
        70,  60,   0,
        50,   30,   0,
        70,  60,  30,
        70,  60,  30,
        50,   30,   0,
        50,   30,  30,

        // bottom diagonal left
        50,   120,   0,
        70,  90,   0,
        70,  90,  30,
        50,   120,   0,
        70,  90,  30,
        50,   120,  30,
        ]),
      gl.STATIC_DRAW);
}

// Fill the buffer with colors for the 'F'.
function setColors(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array([
       // left column front
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,

         // top rung front
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,

         // right column front
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,

       // top diagonal front
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,          
       
       // bottom diagonal front
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       
       // bottom rung front
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,
       20, 180, 50,

         // left column back
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,

         // top rung back
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,

         // right column back
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,

       
       // top diagonal back
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,

       // bottom diagonal back
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,

       // bottom rung back
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,
       80, 70, 200,

         // top
       70, 200, 210,
       70, 200, 210,
       70, 200, 210,
       70, 200, 210,
       70, 200, 210,
       70, 200, 210,

         // top diagonal right
       240, 100, 70,
       240, 100, 70,
       240, 100, 70,
       240, 100, 70,
       240, 100, 70,
       240, 100, 70,

       // bottom diagonal right
       200, 200, 30,
       200, 200, 30,
       200, 200, 30,
       200, 200, 30,
       200, 200, 30,
       200, 200, 30,
 
       // under top rung
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,

         // top of bottom rung
       70, 180, 210,
       70, 180, 210,
       70, 180, 210,
       70, 180, 210,
       70, 180, 210,
       70, 180, 210,

         // right of right column
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,

       // right of left column
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,
       240, 160, 10,

         // bottom
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,
       210, 100, 70,

         // left of left column
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
   
       
       // left of right column
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,
       160, 160, 220,

       // top diagonal left
       240, 80, 30,
       240, 80, 30,
       240, 80, 30,
       240, 80, 30,
       240, 80, 30,
       240, 80, 30,
 
       // bottom diagonal left
       200, 250, 30,
       200, 250, 30,
       200, 250, 30,
       200, 250, 30,
       200, 250, 30,
       200, 250, 30,
    ]),
      gl.STATIC_DRAW);
}

main();
