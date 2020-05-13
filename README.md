<p align="center">
  <a href="https://github.com/homebridge/homebridge"><img src="https://raw.githubusercontent.com/homebridge/branding/master/logos/homebridge-color-round-stylized.png" height="140"></a>
</p>

<span align="center">

# homebridge-http-switch-webhook

[![npm](https://img.shields.io/npm/v/homebridge-http-switch-webhook.svg)](https://www.npmjs.com/package/homebridge-http-switch-webhook) [![npm](https://img.shields.io/npm/dt/homebridge-http-switch-webhook.svg)](https://www.npmjs.com/package/homebridge-http-switch-webhook)

</span>

## Description
This Project deliver a simple, but fail-safe HTTP Switch for HomeBridge with optionnal support for webhook with or without conjuction of polling.

To simplify the webhook, it listens on a port and simply triggers the "status_url" parameter on request. So it needs no parameters.
```shell
http://homebridge_ip:webhook_port
```

## Installation

```shell
npm install -g homebridge-http-switch-webhook
```

## config.json

The following paramteres are supported:

```
    // Switch with polling and a On/Off-State
    {
      "accessory" : "SimpleHttpSwitch",
      "http_method" : "GET",                              // The HTTP-Method
      "ignore_https_security" : false                     // Should the HTTPS Certificate (for all https requests) be validated? (Set it to true if you are using a self-signed cert)
      "set_off_url" : "http://localhost/turn/off",        // The JSON-Webservice URL for turning the device on
      "status_url" : "http://localhost/device/status",    // The JSON-Webservice URL for getting the device's status
      "on_if_this_fn" : "(obj)=>obj.status ? obj.status=='ON' : null", //JS Function for evaluating if the device is on, you can alternativly use the following:
      "on_if_this": {"status":"on"},                      // If you don't want to use on_if_this_fn
      "off_if_this": {"status":"off"},                    // If you don't want to use on_if_this_fn
      "set_on_url" : "http://localhost/turn/on",          // The JSON-Webservice URL for turning the device on
      "polling" : true,                                   // Enable Polling/Refreshing of the Status
      "pollingInterval" : 60,                             // Polling Interval in Seconds
      "name" : "Desk Light",                              // Name of your Switch/Accessory
      "webhook_port" : "3211"                             // (Optionnal) Port to listen for webhook
    }

    // Stateless Switch, will automaticly go off a few miliseconds after switched on
    {
      "accessory" : "SimpleHttpSwitch",
      "set_on_url" : "http://localhost/trigger/something",
      "status_url" : "", // Needs to be empty
      "name" : "Desk Light"
    }
```

## ToDo

*   migrate to a platform instead of a single accessory
*   support other HomeKit-Accessories then 'Switch'
*   migrate to another web server than the now deprecated "express" one.

## Credits
[https://github.com/sinnaj-r/homebridge-simple-http](https://github.com/sinnaj-r/homebridge-simple-http)

