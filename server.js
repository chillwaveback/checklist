var express = require('express');
var session = require('express-session');
var app = express();

var bodyParser = require('body-parser');
var fs = require('fs');
var loki = require('lokijs');
var _ = require('underscore-node');
var jsonfile = require('jsonfile');
var util = require('util');
var rimraf = require('rimraf');

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var configs = require('./env.json');


app.use(session(
    {
        secret: 'lionnnnnn',
        resave: false,
        saveUninitialized: false
    }));

var db = new loki('test.json',
    {
        autoload: true,
        autoloadCallback: loadHandler
    });

var testsCollection;

function loadHandler() {
    testsCollection = db.getCollection('tests');

    if(!testsCollection) {
        testsCollection = db.addCollection('tests');
    }
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
app.use(express.static(__dirname + '/public'));

/*===============================
=            ROUTING            =
===============================*/
var sess = {};

app.get('/', ensureSession, function(req, res){
    res.render('dashboard');
});

app.get('/test/:test_name', function(req, res) {
    res.render('dashboard');
});

app.get('/new', ensureSession, function(req, res){
    res.render('test');
});

app.get('/edit/:test_name', ensureSession, function(req, res){
    res.render('test');
});

app.get('/edit/:release/:test_name', ensureSession, function(req, res){
    res.render('test');
});

app.get('/merge', ensureSession, function(req, res){
    res.render('merge');
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});


/*===========================
=            API            =
===========================*/

app.get('/api/whoami', function(req, res) {
    sess = req.session;
    if(_.isUndefined(sess.name)) {
        res.sendStatus(500);
    } else {
        res.status(200).json({name: sess.name})
    }
});

app.post('/api/whoami', function(req, res) {
    sess = req.session;
    sess.name = req.body.name;
    res.redirect('/');
});

/*==========  TESTS  ==========*/
var isJson = /^.*\.json$/;

//handles filtering non json files out and standard return for tests from db
var parseTestResponse = function(testNames, releaseNumber, returnGrouped) {
    var testList = [];
    var groupCounts = {};

    _.each(testNames, function(testName) {
        if(isJson.test(testName)) {
            var test = testsCollection.findOne({'$and': [{'filename': testName}, {'release': releaseNumber}] });
            var passedCount = 0;
            var failedCount = 0;
            var stepCount = 0;
            var automatedCount = 0;

            var verifiedBy = "";
            if(test !== null) { 
                verifiedBy = test.verified_by;           
                _.each(test.steps, function(step) {
                    if(!step.automated) {
                        var passedTests = _.where(step.verify,{'verified': 'pass'});            
                        passedCount = passedCount + passedTests.length;

                        var failedTests = _.where(step.verify,{'verified': 'fail'});
                        failedCount = failedCount + failedTests.length;
                        
                        if(!_.isUndefined(step.verify)){
                            stepCount = stepCount + step.verify.length;
                        }
                    } else {
                        automatedCount = automatedCount + 1;
                    }
                });
            } else {            
                passedCount = 0;
                failedCount = 0;
                stepCount = 0;
            }

            var notTestedCount = (stepCount - passedCount - failedCount);
            var allPassed = (failedCount == 0) && (notTestedCount == 0) && (passedCount > 0);
            var testGroup;

            // console.log('Test `' + testName + '` for `' + releaseNumber + '` verified by `' + verifiedBy + '`:: Passed:' 
            //     + passedCount + ', Failed:' + failedCount + ', notTestedCount:' + notTestedCount + ', automated: ' + automatedCount
            //     + ', allPassed:' + allPassed);    

            if(returnGrouped){
                var test = jsonfile.readFileSync('tests/regression/'+ testName);
                testGroup = test.test_group;
                if(groupCounts[testGroup]) {
                    // allpassed in test = + 1
                    if(allPassed) {
                        groupCounts[testGroup].passedCount++;
                    }
                    
                    // a failure in test = + 1
                    if(failedCount > 0) {
                        groupCounts[testGroup].failedCount++;
                    }
                } else {
                    groupCounts[testGroup] = {};
                    groupCounts[testGroup].passedCount = allPassed ? 1 : 0;
                    groupCounts[testGroup].failedCount = failedCount > 0 ? 1 : 0;
                }
            }

            testList.push({
                name: testName,
                stepCount: stepCount,
                passedCount: passedCount,
                failedCount: failedCount,
                notTestedCount: notTestedCount,
                testedCount: (passedCount + failedCount),
                automatedCount: automatedCount,
                verified_by: verifiedBy,
                allPassed: allPassed,
                test_group: testGroup
            });
        }
    });
                    
    if(returnGrouped) {
        //first get hash of groupname => list of tests
        testList = _.groupBy(testList, "test_group");
        //then go through hash keys, and create new structure with metadata
        _.each(_.keys(testList), function(key) {
            testList[key] = {
                tests: testList[key],
                passedCount: groupCounts[key].passedCount,
                failedCount: groupCounts[key].failedCount
            }
        });
    }

    return testList;
};

var styleName = function(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
}

// put /api/tests/:release_number/merge

// all tests for a release: release specific and regression
app.get('/api/tests/:release_number', function(req, res) {
    console.log('GET /api/tests/' + req.params.release_number);
    var regression_tests = fs.readdirSync('tests/regression/');
    var release_tests;
    try {
        release_tests = fs.readdirSync('tests/release/'+req.params.release_number+'/');
    } catch(e) {
        release_tests = [];
    }

    // Add current status to test label
    var returnGrouped = true;
    var regression_test_list = parseTestResponse(regression_tests, req.params.release_number, returnGrouped);
    var release_test_list = parseTestResponse(release_tests, req.params.release_number, !returnGrouped);

    var toReturn = {
        release: release_test_list,
        regression: regression_test_list
    }

    res.status(200).json(toReturn);
});

//get only regression template names
app.get('/api/test/regression', function(req, res) {
    console.log('GET /api/test/regression');
    var testList = [];
    var files = fs.readdirSync('tests/regression/');

    files.forEach(function(file) {
        if (!fs.statSync('tests/regression/' + file).isDirectory() && isJson.test(file)) {
          testList.push({
            name: file,
            stepCount: 0,
            passedCount: 0,
            failedCount: 0,
            notTestedCount: 0,
            testedCount: 0,
            verified_by: null,
            allPassed: false
          });
        }
    });
    res.status(200).json(testList);
});

//gets a specific test from db or template if none in db
app.get('/api/test/:name/:release', function(req, res) {
    console.log('GET /api/test/' + req.params.name + "/" + req.params.release);
    var result = testsCollection.findOne({
        '$and' : [
            {
                'filename': req.params.name
            },
            {
                'release': req.params.release
            }
            ]
        });

    if(result) {
        console.log('FOUND IN DB, RETURNING RELEASE VERSION: ' + req.params.name + ":" + req.params.release);
        res.status(200).json(result);
    } else {
        console.log('NOT FOUND, RETURNING TEMPLATE: ' + req.params.name);
        var test;
        try {
            test = jsonfile.readFileSync('tests/regression/'+req.params.name);
        }catch(e) {
            console.log(e);
            console.log('second try');
            test = jsonfile.readFileSync('tests/release/'+req.params.release+'/'+req.params.name);
        }
        res.status(200).json(test);
    }
});

//gets a specific template
app.get('/api/template/:name/:release', function(req, res) {
    console.log('GET /api/template/' + req.params.name + "/" + req.params.release);
    var test;
    try {
        if(req.params.release === 'undefined') {
            test = jsonfile.readFileSync('tests/regression/'+req.params.name);
        } else {
            test = jsonfile.readFileSync('tests/release/'+req.params.release+'/'+req.params.name);
        }

        res.status(200).json(test);
    } catch(e) {
        res.sendStatus(500);
    }
});

//Adds/Updates Specific Test File in DB
app.post('/api/test/:name', function(req, res) {
    console.log('POST /api/test/' + req.params.name + ": " + req.body.release);
    req.body.filename = styleName(req.params.name);

    var result = testsCollection.findOne({
        '$and' : [
            {
                'filename': req.body.filename
            },
            {
                'release': req.body.release
            }
            ]
        });
    
    if(!result) {
        console.log('NOT FOUND IN DB, SAVING: ' + req.body.filename + " / " + req.body.release);
        testsCollection.insert(req.body);
        db.save();
        io.emit('checklist:reloadReleases', req.body.release, req.body.filename);
        res.status(200).json(req.body);
    } else {
        console.log('FOUND IN DB: ' + req.body.filename + " / " + req.body.release);
        testsCollection.update(req.body);
        db.save();
        io.emit('checklist:reloadReleases', req.body.release, req.body.filename);
        res.status(200).json(req.body);
    }
});

//add/overwrite test to release specific folder
app.post('/api/test/release/:release_number', function(req, res) {
    console.log('POST /api/test/release/' + req.params.release_number);
    req.body.filename = styleName(req.body.filename);
    try {
        var dir = 'tests/release/'+req.params.release_number+'/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        jsonfile.writeFileSync(dir + req.body.filename, req.body);
        res.sendStatus(200);
    } catch(e) {
        console.log(e);
        throw e;
        res.sendStatus(500);
    }
});

//add/overwrite test to regression folder
app.post('/api/test/regression/:filename', function(req, res) {
    console.log('POST /api/test/regression/' + req.params.filename);
    req.params.filename = styleName(req.params.filename);
    try {
        var dir = 'tests/regression/';
        jsonfile.writeFileSync(dir + req.params.filename, req.body);
        res.sendStatus(200);
    } catch(e) {
        console.log(e);
        throw e;
        res.sendStatus(500);
    }
});

//get all tests that are available to be merged
app.get('/api/test/merge', function(req, res) {
    console.log('GET /api/test/merge');
    var releaseDirectories = [];
    var directories = fs.readdirSync('tests/release/');
    var toReturn = [];

    //get all the directories with release tests
    directories.forEach(function(file) {
        if (fs.statSync('tests/release/' + file).isDirectory()) {
          releaseDirectories.push(file);
        }
    });

    releaseDirectories.forEach(function(directory) {
        //get tests for each one
        var files = fs.readdirSync('tests/release/'+directory);
        var releaseTests = [];        
        files.forEach(function(file) {
            if (!fs.statSync('tests/release/'+ directory + '/' + file).isDirectory() && isJson.test(file)) {
                var jsonTest = jsonfile.readFileSync('tests/release/' + directory + '/' + file);
                releaseTests.push(jsonTest);
            }
        });

        toReturn.push({
            release: directory,
            tests: releaseTests
        });
    });

    res.status(200).json(toReturn);
});

//merge a specific release back into regression tests and delete folder
app.post('/api/test/merge/:release_number', function(req, res) {
    console.log('POST /api/test/merge/' + req.params.release_number);
    var directory = 'tests/release/'+req.params.release_number+'/';
    var regression_directory = 'tests/regression/';
    var files = fs.readdirSync(directory);
    files.forEach(function(file) {
        if (!fs.statSync(directory + file).isDirectory() && isJson.test(file)) {
            var releaseTest = jsonfile.readFileSync(directory + file);
            if(_.isUndefined(releaseTest.merge_into)) {
                //save file into regression folder
                jsonfile.writeFileSync(regression_directory + file, releaseTest);
            } else {
                //open up regression file
                var regressionTest = jsonfile.readFileSync(regression_directory + releaseTest.merge_into);
                //append tests steps to regression
                regressionTest.steps = regressionTest.steps.concat(releaseTest.steps);
                //save regression
                jsonfile.writeFileSync(regression_directory + releaseTest.merge_into, regressionTest);
            }
        }
    });

    //delete release folder from fs
    rimraf.sync(directory);
    res.sendStatus(200);
});

//checks for existence of json files and deletes directory if it has none
var deleteEmptyDirectory = function(directory) {
    var files = fs.readdirSync(directory);
    var deleteDirectory = true;

    files.forEach(function(file) {
        if (isJson.test(file)) {
            deleteDirectory = false;        
        }
    });

    if(deleteDirectory) {
        console.log('deleting directory: ' + directory);
        rimraf.sync(directory);
    }
};

//merge a specific release back into regression tests and delete folder if empty
app.post('/api/test/merge/:release_number/:test_name', function(req, res) {
    console.log('POST /api/test/merge/' + req.params.release_number + '/' + req.params.test_name);
    var directory = 'tests/release/'+req.params.release_number+'/';
    var regression_directory = 'tests/regression/';
    var releaseTest = jsonfile.readFileSync(directory + req.params.test_name);

    if(_.isUndefined(releaseTest.merge_into)) {
        //save file into regression folder
        jsonfile.writeFileSync(regression_directory + req.params.test_name, releaseTest);
    } else {
        //open up regression file
        var regressionTest = jsonfile.readFileSync(regression_directory + releaseTest.merge_into);
        //append tests steps to regression
        regressionTest.steps = regressionTest.steps.concat(releaseTest.steps);
        //save regression
        jsonfile.writeFileSync(regression_directory + releaseTest.merge_into, regressionTest);
    }

    fs.unlinkSync(directory + req.params.test_name);
    deleteEmptyDirectory(directory);
    res.sendStatus(200);
});

//delete a specific release test and folder if its empty
app.delete('/api/test/merge/:release_number/:test_name', function(req, res) {
    console.log('DELETE /api/test/merge/' + req.params.release_number + '/' + req.params.test_name);
    var directory = 'tests/release/'+req.params.release_number+'/';
    fs.unlinkSync(directory +req.params.test_name);

    //check to see if there are files in folder, if empty then delete folder
    deleteEmptyDirectory(directory);
    res.sendStatus(200);
});

//flushes saved db file
app.delete('/api/test/:name/:release', function(req, res) {
    console.log('DELETE /api/test/' + req.params.name + "/" + req.params.release);
    var result = testsCollection.findOne({
        '$and' : [
            {
                'filename': req.params.name
            },
            {
                'release': req.params.release
            }
            ]
        });

    if(result) {
        testsCollection.remove(result);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

function ensureSession(req, res, next) {
    sess = req.session;
    if(_.isUndefined(sess.name)) {
        res.render('greeting');
    } else {
        return next();
    }
}

server.listen(configs.port, function() {
    console.log('checklist started @ localhost:' + configs.port);
});
