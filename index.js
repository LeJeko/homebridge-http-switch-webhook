var request = require("request-promise-native");
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory("homebridge-http-switch-webhook", "httpSwitchWebhook", httpSwitchWebhookAccessory)
}

function httpSwitchWebhookAccessory(log, config) {
  this.log = log;

  // URLs
  this.status_url = config["status_url"] || false
  this.set_on_url = config["set_on_url"]
  this.set_off_url = config["set_off_url"]

  // HTTP Stuff
  this.http_method = config["http_method"] || "GET"
  this.ignore_https_security = config["ignore_https_security"] || false

  // State Stuff
  this.on_ifth_is = config["on_ifth_is"]
  this.off_if_this = config["off_if_this"]

  // Polling Stuff
  this.polling = config["polling"] || false
  this.pollingInterval = parseInt(config["pollingInterval"] || 5, 10) // In Seconds

  this.on_if_this_fn =
      config["on_if_this_fn"] && eval(config["on_if_this_fn"])
  // General
  this.name = config["name"]

  // Webhook Stuff
  this.webhook_port = config["webhook_port"] || "3211"

  if (this.webhook_port != "") {
    if (this.status_url == "") {
      this.log("Status url missing for webhook. Web server will not start.")
    } else {
      app.use(bodyParser.json())
      app.get('/', (req, res) => {
          var ret = req.query
          var json = JSON.stringify(ret)
          this.log('Webhook received')
          res.send('Got it!')
          this.switchService.getCharacteristic(Characteristic.On).getValue()
      })
      app.listen(this.webhook_port, () => {
          this.log('Listening on port %s', this.webhook_port)
      })
    }
  }
}

httpSwitchWebhookAccessory.prototype.getServices = function () {
    var package = require('./package.json')
    var informationService = new Service.AccessoryInformation()
    informationService
        .setCharacteristic(Characteristic.Manufacturer, "Homebridge")
        .setCharacteristic(Characteristic.Model, "HTTP Switch webhook")
        .setCharacteristic(Characteristic.SerialNumber, package.version)
        .setCharacteristic(Characteristic.FirmwareRevision, package.version)

    this.switchService = new Service.Switch()
    if (this.status_url) {
        this.switchService
            .getCharacteristic(Characteristic.On)
            .on("get", this.getState.bind(this))
            .on("set", this.setState.bind(this))
    }
    else {
        this.switchService
            .getCharacteristic(Characteristic.On)
            .on("get", this.getState.bind(this))
            .on("set", this.setState.bind(this))
    }
    if (this.polling) {
        this.statePolling()
    }    
    return [this.switchService, informationService]
}

httpSwitchWebhookAccessory.prototype.makeRequest = function (url) {
  if (this.ignore_https_security == true) {
    const agentOptions = {
        rejectUnauthorized: false
    }
    return request({
        url,
        agentOptions,
        method: this.http_method,
        json: true
    })
  } else {
      return request(url, {
          method: this.http_method,
          json: true
      })
  }
}

httpSwitchWebhookAccessory.prototype.getState = function (callback) {
  var _this = this;
  if (!this.status_url) {
      callback(null, false);
      return;
  }
  this.makeRequest(this.status_url)
      .then(function (res) {
      var ret = res;
      var retString = JSON.stringify(ret);
      if (_this.on_if_this_fn) {
          var onStatus = _this.on_if_this_fn(ret);
          if (onStatus !== null) {
              callback(null, onStatus);
              _this.log("HTTP state get function succeeded! (" + retString + ")");
              return;
          }
          callback(Error("Status function not known"));
          _this.log("Status function not known");
          return;
      }
      if (retString == JSON.stringify(_this.on_if_this)) {
          callback(null, true);
          _this.log("HTTP state get succeeded! (" + retString + ")");
      }
      else if (retString == JSON.stringify(_this.off_if_this)) {
          callback(null, false);
          _this.log("HTTP state get succeeded! (" + retString + ")");
      }
      else {
          callback(Error("Status not known"));
          _this.log("Status not known");
      }
  })
      .catch(function (err) {
      _this.log("HTTP state get failed! (" + err + ")");
      callback(err);
  });
}

httpSwitchWebhookAccessory.prototype.statePolling = function () {
  clearTimeout(this.pollingTimeOut);
  this.log("[" + this.name + "] POLLING STATUS");
  this.switchService.getCharacteristic(Characteristic.On).getValue();
  this.pollingTimeOut = setTimeout(this.statePolling.bind(this), this.pollingInterval * 1000);
}

httpSwitchWebhookAccessory.prototype.setState = function (powerOn, callback) {
  var _this = this;
  var body;
  var uri = powerOn ? this.set_on_url : this.set_off_url;
  uri = this.status_url ? uri : this.set_on_url;
  this.makeRequest(uri)
      .then(function (res) {
      _this.log("HTTP power function succeeded! (" + JSON.stringify(res) + ")");
      if (!_this.status_url) {
          setTimeout(function () {
              return _this.switchService
                  .getCharacteristic(Characteristic.On)
                  .getValue();
          }, 300);
      }
      callback();
  })
      .catch(function (err) {
      _this.log("HTTP power function failed");
      callback(err);
  });
}

httpSwitchWebhookAccessory.prototype.identify = function (callback) {
  this.log("Identify requested!");
  callback(); // success
}
