var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var path = require('path');
var fu = require('../fileutil');
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;

var uglify  = function (from_file, to_file, gen_config,  done) {

    fs.readFile(from_file, 'utf8', function (err, content) {
        if (err) {
            return done(err);
        }

        var compressed; 
        var ast;

        try {
            ast = jsp.parse(content);
            ast = pro.ast_mangle(ast);
            ast = pro.ast_squeeze(ast);
            compressed = pro.gen_code(ast, gen_config);
        } catch (ex) {
            ex.message = ex.message + ' [' + from_file + ']';
            return done(ex);
        }

        compressed += '; ';
        fs.writeFile(to_file, compressed, done);
    });
}

/**
 * plugin uglifyjs for FrontBuild
 * only build the temp_build dir
 * minify xx.js to xx-min.js
 * @param  {[type]}   page [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports = function (config) {

    config = _.extend({
        ascii_only: true
    }, config);

    var options = {
        ascii_only: true
    };

    return function (page, next) {
        var start_time = new Date();
        var reports = {
            name: 'uglifyjs',
            files: []
        };

        var minReg = /.+-min\.js$/i;
        var jsReg = /.+\.js$/i;
        var dir = page.destDir;
        var config = {};
        if (page.config.uglifyjs) {
            _.extend(config, page.config.uglifyjs);
        }

        if (config.options) {
            _.extend(options, config.options);
        }

        fu.findInDir(dir, jsReg, function(err, list){
            if (err) {
                return next(err);
            }

            //去掉压缩版的
            list = _.filter(list, function(p){
                return !minReg.test(p);
            });


            async.forEach(list, function(file, callback) {
                reports.files.push(file);
                var from_file = path.resolve(dir, file);
                var to_file = from_file.replace(/\.js$/i, '-min.js');
                // 检查压缩版是否已存在， 有则忽略之
                fs.stat(to_file, function (err, stat) {
                    if (err) {
                        uglify(from_file, to_file, options, callback);
                        return;
                    }
                    callback(null);
                });
            }, function (err) {
                if (err) {
                    return next(err);
                }
                next(null, reports);
            });
        });
    }
};
    