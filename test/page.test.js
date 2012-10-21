var Page = require('../lib/page');
var App = require('../lib/app');
var should = require('should');
var path = require('path');
var fs = require('fs');
var fu = require('../lib/fileutil');


describe('Page parser test', function(){
    var src = [
        {
            from: 'page@1.0',
            parsed: {
                name: 'page',
                version: '1.0'
            }
        },
        {
            from: 'page/1.0',
            parsed: {
                name: 'page',
                version: '1.0'
            }
        },
        {
            from: 'page\\1.0',
            parsed: {
                name: 'page',
                version: '1.0'
            }
        },
        {
            from: 'page\\1.0\\',
            parsed: {
                name: 'page',
                version: '1.0'
            }
        },
        {
            from: 'page/1.0/',
            parsed: {
                name: 'page',
                version: '1.0'
            }
        },
        {
            from: '_~-page/1.0',
            parsed: {
                name: '_~-page',
                version: '1.0'
            }
        },
        {
            from: '_/page/1.0',
            parsed: null
        },
        {
            from: '_(page)/1.0',
            parsed: null
        },
        {
            from: '-page/1.0',
            parsed: null
        },
        {
            from: 'page/3.10000.1',
            parsed: {
                name: 'page',
                version: '3.10000.1'
            }
        },
        {
            from: 'page/1.0',
            parsed: {
                name: 'page',
                version: '1.0'
            }
        },
        {
            from: '_/1.0',
            parsed: {
                name: '_',
                version: '1.0'
            }
        },
        {
            from: 'abcdefghijklmnopqrstuvwxyz/1.0',
            parsed: {
                name: 'abcdefghijklmnopqrstuvwxyz',
                version: '1.0'
            }
        },
    ];

    it('should parsed all the tests', function(){
        src.forEach(function(item){
            var parsed = Page.parsePageVersion(item.from);
            if (item.parsed === null) {
                should.not.exist(parsed);
            } else {
                parsed.should.be.eql(item.parsed);
            }
        });
    });
});

describe('page build test', function(){
    var pageName = 'page1';
    var app = new App({
        rootDir: path.resolve('sample-project')
    });

    var rootDir = path.resolve('sample-project', pageName);
    var version = '1.0';
    var timestamp = '20121212';
    var thepage;
    var buildReports;

    before(function (done) {
        app.getConfig(function(err, config){
            if (err) {
                return done(err);
            }


            thepage = new Page({
                rootDir: rootDir,
                name: pageName,
                app: app
            });
            
            thepage.setVersion(
                version, 
                function(err){
                    if (err) {
                        return done(err);
                    }
                    thepage.build(timestamp, function (err, reports) {
                        if (err) {
                            return done(err);
                        }

                        buildReports = reports;
                        done();
                    });
                }
            );
        });


    });

    after(function (done) {
        fu.rmTreeSync(path.resolve(rootDir, timestamp));
        fs.unlinkSync(path.resolve(rootDir, version, 'page/tpl/foo-tpl.js'))
        done();
    });

    it('should be a Page object', function () {
        thepage.name.should.be.eql(pageName);
        thepage.rootDir.should.eql(rootDir);
        thepage.config.should.be.a('object');
        should.exist(thepage.srcDir);
        should.exist(thepage.destDir);
    });

    it('should create timestamp directory under rootDir', function(done){
        path.exists(path.resolve(rootDir, timestamp), function (exist) {
            exist.should.be.true;
            done();
        });
    });

    it('should create page under timestamp directory', function(done){
        path.exists(path.resolve(rootDir, timestamp, 'page'), function (exist) {
            exist.should.be.true;
            done();
        });
    });

    it('should create concat files list in fb.page.json', function(done){
        fs.readFile(path.resolve(rootDir, timestamp, 'page/concat.js'), 'utf8', function (err, content) {
            if (err) {
                return done(err);
            }
            content.should.include('mods:mod1.js');
            content.should.include('mods:mod2.js');
            done();
        });
    });

    it('should create concat css files list in fb.page.json', function(done){
        fs.readFile(path.resolve(rootDir, timestamp, 'page/concat.css'), 'utf8', function (err, content) {
            if (err) {
                return done(err);
            }
            content.should.include('#a.css');
            content.should.include('#b.css');
            done();
        });
    });

    it('should build less', function(done) {
        var buildLessFile = path.resolve(rootDir, timestamp, 'page/lessfile.css');

        fs.readFile(buildLessFile, 'utf8', function(err, data) {
            if (err) {
                return done(err);
            }
            data.should.include('#a.less');
            done();
        });
        
    });

    it('should build kissy js file', function(done) {
        var buildjsfile = path.resolve(rootDir, timestamp, 'page/index.js');

        fs.readFile(buildjsfile, 'utf8', function(err, data) {
            if (err) {
                return done(err);
            }
            data.should.include("KISSY.add('page/mods/mod1',");
            data.should.include("KISSY.add('page/mods/mod2',");
            data.should.include("KISSY.add('page/index',");
            data.should.include("KISSY.add('page/mods/submod1',");
            data.should.include("KISSY.add('page/mods/submod2',");
            data.should.include("KISSY.add('page/tpl/foo-tpl',");
            data.should.include("KISSY.add('utils/sample/index',");
            //utils
            data.should.include("utils-sample-index.js");
            done();
        });
        
    });

    it('should compress css to -min.css', function(done) {
        var minLessCss = path.resolve(rootDir, timestamp, 'page/lessfile-min.css');
        var minIndexCss = path.resolve(rootDir, timestamp, 'page/index-min.css')

        fs.readFile(minLessCss, 'utf8', function(err, data) {
            if (err) {
                return done(err);
            }
            data.should.include('#a.less');

            fs.readFile(minIndexCss, 'utf8', function(err, data) {
                if (err) {
                    return done(err);
                }
                data.should.include('#a.css');
                data.should.include('#b.css');
                done();
            });
        });
        
    });

    it('should support gbk utils directory with css-combo', function (done) {
        var minIndexCss = path.resolve(rootDir, timestamp, 'page/index-min.css')
        fs.readFile(minIndexCss, 'utf8', function(err, data) {
            if (err) {
                return done(err);
            }
            data.should.include('.gbkmod');
            data.should.include('宋体');
            done();
        });
    });

    it('should compress js to -min.js', function(done) {
        var minIndexJS = path.resolve(rootDir, timestamp, 'page/index-min.js');

        fs.readFile(minIndexJS, 'utf8', function (err, data) {
            if (err) {
                return done(err);
            }
            data.should.include('mods:mod1');
            data.should.include('mods:mod2');
            data.should.include('mods:submod1');
            data.should.include('mods:submod2');
            done();
        });
    });

    it('should compress concated js to -min.js', function(done) {

        var minConcatJS = path.resolve(rootDir, timestamp, 'page/concat-min.js');

        fs.readFile(minConcatJS, 'utf8', function (err, data) {
            if (err) {
                return done(err);
            }
            data.should.include('mods:mod1');
            data.should.include('mods:mod2');
            done();
        });

    });

    it('should produce reports', function () {
        var pluginsReports = buildReports.plugins;
        var fbReports = buildReports.fb;


        fbReports.should.be.a('object')

        fbReports
            .should.have.property('build_start_time')

        fbReports
            .should.have.property('build_version')
            
        fbReports
            .should.have.property('build_used_time');

        pluginsReports.forEach(function (report) {
            report.should.have.property('name');
            report.should.have.property('used_time');
        });

    });

});

describe('gbk page build test', function () {
    var pageName = 'page1';
    var version = '2.0';
    var timestamp = '000000';
    var buildReports;
    var thepage;
    var rootDir = 'sample-project';
    var pageRootDir = path.join(rootDir, pageName);
    var app = new App({
        rootDir: rootDir
    });

    after(function () {
        fu.rmTreeSync(path.join(pageRootDir, timestamp));
    });

    before(function (done) {
        app.getConfig(function(err, config){
            if (err) {
                return done(err);
            }

            thepage = app.getPage(pageName);
            
            thepage.setVersion(
                version, 
                function(err){
                    if (err) {
                        return done(err);
                    }
                    thepage.build(timestamp, function (err, reports) {
                        if (err) {
                            return done(err);
                        }

                        buildReports = reports;
                        done();
                    });
                }
            );
        });
    });

    it('should conv the right with css-combo', function (done) {
        var timestampPath = path.join(pageRootDir, timestamp);
        fs.readFile(path.join(timestampPath, 'page/index.css'), function (err, buf) {
            var iconv = require('iconv-lite');
            if (err) {
                return done(err);
            }
            var cnt = iconv.decode(buf, 'gbk');
            cnt.should.include('index楷体');
            cnt.should.include('黑体');
            done();
        });
    });
});

describe('page build test with error', function(){
    var pageName = 'page_with_error';

    var app = new App({
        rootDir: path.resolve('sample-project')
    });

    var rootDir = path.resolve('sample-project', pageName);

    var version = '1.0';
    var timestamp = '20121212';
    var thepage;
    var buildReports;

    before(function (done) {
        app.getConfig(function(err, config){
            if (err) {
                return done(err);
            }

            thepage = new Page({
                rootDir: rootDir,
                name: pageName,
                app: app
            });
            
            thepage.setVersion(
                version, 
                function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                    
                }
            );
        });

    });

    after(function (done) {
        fu.rmTreeSync(path.resolve(rootDir, timestamp));
        fu.rmTreeSync(path.resolve(rootDir, 'page_build_temp'));
        fu.rmTreeSync(path.resolve(rootDir, 'page_src_temp'));
        done();
    });

    it('should get an error when build page_with_error/1.0', function (done) {

        thepage.build(timestamp, function (err, reports) {
            should.exist(err);
            done();
        });

    });
});

describe('page add version test', function(){
    var rootDir = path.resolve('sample-project', 'page1');
    var version = '10.0';
    var thepage;

    before(function (done) {
        thepage = new Page({rootDir: rootDir});
        thepage.addVersion(version, done);
    });

    after(function (done) {
        fu.rmTreeSync(path.resolve(rootDir, version));
        done();
    });

    it('should create a fb.page.json. contain standard json', function(done) {
        fu.readJSON(path.resolve(rootDir, version, 'fb.page.json'), function (err, data){
            should.not.exist(err);
            data.should.be.ok;
            done();
        });
    });

    it('should create a fb-build.sh and fb-build.bat file', function(done) {
        fs.readFile(path.resolve(rootDir, version, 'fb-build.sh'), 'utf-8', function (err, shfile){
            if (err) {
                done(err);
            }
            shfile.should.be.ok;
            fs.readFile(path.resolve(rootDir, version, 'fb-build.bat'), 'utf-8', function (err, batfile){
                if (err) {
                    done(err);
                }
                batfile.should.be.ok

                done();
            });
        });
    });

    it('should create all default directories', function(done) {
        var count = 0;
        var dir_count = 0;
        var dirs = ['page', 'page/mods', 'test'];
        dirs.forEach(function(dir){
            path.exists(path.resolve(rootDir, version, dir), function(exist){
                count ++;

                if (exist) {
                    dir_count++;
                }
                if (count === dirs.length) {
                    dir_count.should.eql(count);
                    done();
                }
            });
        });
    });

    

});


describe('page addVersion test', function(){

    var pageName = 'page1';
    var rootDir = path.resolve('sample-project', pageName);
    var version = '100.002';
    var thepage;

    before(function (done) {
        thepage = new Page({
            rootDir: rootDir,
            name: pageName
        });

        thepage.addVersion(version, done);

    });

    after(function (done) {
        fu.rmTreeSync(path.resolve(rootDir, version));
        done();
    });

    it('should create a fb.page.json in rootDir', function (done) {
        var json_path = path.resolve(rootDir, version, 'fb.page.json');
        fu.readJSON(json_path, function (err, json) {
            if (err) {
                return done(err);
            }
            json.should.be.ok;
            json.should.be.a('object');
            // should.exist(json.outputCharset);
            // should.exist(json.inputCharset);
            done(null);
        });
    });
});

describe('page#getTimestamps', function () {
    var pageName1 = 'page1';
    var rootDir1 = path.resolve('sample-project', pageName1);
    var page1 = new Page({
        name: pageName1,
        rootDir: rootDir1
    });

    var pageName2 = 'page_with_timestamp';
    var rootDir2 = path.resolve('sample-project', pageName2);
    var page_with_timestamp = new Page({
        name: pageName2,
        rootDir: rootDir2
    });

    it('should get a blank array with no pub directories', function (done) {
        page1.getTimestamps(function(err, timestamps) {
            should.not.exist(err);
            timestamps.should.be.an.array;
            timestamps.length.should.eql(0);
            done();
        });
    });

    it('should get all the pub timestamps', function (done) {
        page_with_timestamp.getTimestamps(function(err, timestamps) {

            should.not.exist(err);
            timestamps.should.be.ok;
            // timestamps.should.include('20120901')
            timestamps.length.should.eql(3);
            done();
        });
    });

});
