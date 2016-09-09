![alt tag](https://raw.githubusercontent.com/Lotame/checklist/master/public/img/logo.png)


## About
checklist is a simple application that helps keep track of your manual test cases. You can create and edit tests for regression or release. You can also merge release tests into the regression suite.

Built on a stack of: 
* Lokidb
* Express
* Node 
* Angular

## Installation / Running
 
#### Dependencies
1. nodejs
2. npm

#### Installation
1. clone this repo and navigate to it in a terminal
2. copy environment specific file from sample: `cp env.json.sample env.json`
3. install node dependencies: `npm install`
4. start application: `npm start` 
   * You should see `checklist started @ localhost:7778` when the server has loaded. 
5. Point a browser to [checklist](http://127.0.0.1:778/) and have fun!

#### Configs
1. configs.json : currently just holds the port the server runs on
2. /public/js/angular/app.config.js : defines your test groups, starting url for tests

## Author
#### Andrew Nichols

##### Contributors
- Mark Conrad
- Summer Romack 
- Meg MacDougall

## License
See License.MD