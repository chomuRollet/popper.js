'use strict';

var grunt = require('grunt');
var fs = require('fs');

var version = JSON.parse(fs.readFileSync('./package.json')).version;

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
grunt.loadNpmTasks('grunt-karma');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-serve');
grunt.loadNpmTasks('grunt-banner');
grunt.loadNpmTasks('grunt-shell-spawn');
grunt.loadNpmTasks('grunt-env');

module.exports = function(grunt) {

    // comma separated list of browsers to run tests inside
    var browsers = grunt.option('browsers') ? grunt.option('browsers').split(',') : ['ChromeTest'];

    // Project configuration.
    grunt.initConfig({
        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'build/popper.min.js.map',
                    preserveComments: /(?:license|version)/
                },
                files: {
                    'build/popper.min.js': ['build/popper.js']
                }
            }
        },
        copy: {
            dist: {
                nonull: true,
                src: 'src/popper.js',
                dest: 'build/popper.js',
            }
        },
        jsdoc2md: {
            oneOutputFile: {
                src: 'src/*.js',
                dest: 'doc/documentation.md'
            }
        },
        karma: {
            options: {
                frameworks: ['jasmine'],
                singleRun: false,
                browsers: browsers,
                customLaunchers: {
                    'ChromeTest': {
                        base: 'Chrome',
                        flags: ['--window-size=800,872'] // 800x800 plus karma shell
                    }
                },
                files: [
                    { pattern: 'bower_components/**/*.js', included: false },
                    { pattern: 'bower_components/requirejs/require.js', included: true },
                    { pattern: 'src/**/*.js', included: false },
                    'tests/*.js',
                    'tests/styles/*.css'
                ]
            },
            unit: {}
        },
        jshint: {
            default: ['src/**/*.js']
        },
        serve: {
            options: {
                port: 9000
            }
        },
        usebanner: {
            dist: {
                options: {
                    replace: '\{\{version\}\}',
                    banner: version,
                    position: 'replace',
                },
                files: {
                    src: [ 'build/popper.js' ]
                }
            }
        },
        shell: {
            xvfb: {
                command: 'Xvfb :99 -ac -screen 0 1600x1200x24',
                options: {
                    async: true
                }
            }
        },
        env: {
            xvfb: {
                DISPLAY: ':99'
            }
        }
    });

    grunt.registerTask('doc', ['jsdoc2md']);
    grunt.registerTask('dist', [ 'copy:dist', 'usebanner:dist', 'uglify:dist']);
    grunt.registerTask('test', ['jshint', 'karma:unit']);
    grunt.registerTask('test-ci', ['jshint', 'shell:xvfb', 'env:xvfb', 'karma:unit', 'shell:xvfb:kill']);
};
