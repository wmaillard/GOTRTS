module.exports = function(grunt) {
  var path = 'public/js/src/';
  var files = ['preLoad.js', 'blockingTerrain.js', 'generalUtilities.js', 'drawingUtilities.js', 'entityUtilities.js', 'castles.js',
  'entityInfo.js', 'globals.js', 'mapPointUtilities.js',
  'controlFunctions.js', 'drawMap.js', 'drawEntities.js', 'bindButtons.js', 'entities.js',  
  'hammerSetup.js', 'setUpSocketListeners.js', 'playerControls.js', 'main.js'];
  for(var i = 0; i < files.length; i++){
    files[i] =  path + files[i];
  }
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: true,
	compress: {
		sequences: true,
		dead_code: true,
		conditionals: true,
		booleans: true,
		unused: true,
		if_return: true,
		join_vars: true,
		drop_console: true
	}
      },
     my_target: {
          files: {
            'public/js/build/game.min.js': files
          }
    }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
};