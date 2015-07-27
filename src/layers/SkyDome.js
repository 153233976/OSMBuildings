
var SkyDome = {};

(function() {

  var radius = 100;

  var NUM_LON_UNITS = 20;
  var NUM_LAT_UNITS = 10;

  var shader;

  var vertices = [];
  var texCoords = [];

  var tris = Triangulate.dome({}, {}, radius, 0, 0);

  var vertexBuffer;
  var texCoordBuffer;
  var texture;

  function getScale() {
    var screenRadius = Math.sqrt(Scene.width*Scene.width + Scene.height*Scene.height);
    var scale = 1/Math.pow(2, MIN_ZOOM-Map.zoom);
    return screenRadius * scale / radius;
  }

  SkyDome.initShader = function() {
    shader = new Shader('textured');
    vertexBuffer = new GL.Buffer(3, new Float32Array(tris.vertices));
    texCoordBuffer = new GL.Buffer(2, new Float32Array(tris.texCoords));
    texture = new GL.Texture();
    texture.load(BASE_DIR +'/assets/skydome.jpg');
  };

  SkyDome.render = function() {
    if (!texture.isLoaded) {
      return;
    }

    shader.enable();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mMatrix = new Matrix();

    var scale = getScale();
    mMatrix.scale(scale, scale, scale);

    mMatrix
      .rotateZ(Map.rotation)
      .translate(Scene.width/2, Scene.height/2, 0)
      .rotateX(Map.tilt)
      .translate(0, Scene.height/2, 0)
      .multiply(Scene.perspective);

    gl.uniformMatrix4fv(shader.uniforms.uMatrix, false, mMatrix.data);

    vertexBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aPosition, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    texCoordBuffer.enable();
    gl.vertexAttribPointer(shader.attributes.aTexCoord, texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    texture.enable(0);
    gl.uniform1i(shader.uniforms.uTileImage, 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numItems);

    shader.disable();
  };

  SkyDome.getRadius = function() {
    return radius * getScale();
  };

}());