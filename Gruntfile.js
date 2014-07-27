var path = require('path');
var gitbook = require('gitbook');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-gitbook');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-http-server');

    grunt.initConfig({
        'gitbook': {
            development: {
                input: './',
                github: 'basisjs/articles',
                pluginsConfig: {
                  fontSettings: {
                    theme: 'white',
                    family: 'sans',
                    size: 1
                  }
                }
            }
        },
        'gh-pages': {
            options: {
                base: '_book'
            },
            src: ['**']
        },
        'clean': ['_book', '.grunt'],
        'http-server': {
            'dev': {
                // the server root directory
                root: '_book',

                port: 4000,
                host: '127.0.0.1',

                showDir : true,
                autoIndex: true,
                defaultExt: 'html',

                //wait or not for the process to finish
                runInBackground: false
            }
        }
    });

    grunt.registerMultiTask('gitbook', 'gitbook builder', function() {
        var config = this.data;
        var done = this.async();
        
        gitbook
            .generate
            .folder(config)
            .then(function(){
                done();
            }, done);
    });

    grunt.registerTask('test', [
        'gitbook',
        'http-server'
    ]);
    grunt.registerTask('publish', [
        'gitbook',
        'gh-pages',
        'clean'
    ]);
    grunt.registerTask('default', 'gitbook');
};
