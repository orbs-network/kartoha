#!/usr/bin/env node

const { readFileSync } = require("fs");
const { resolve } = require("path");
const { template, merge, isEmpty, map } = require("lodash");
const yargs = require("yargs");

function generateConfig(files) {
    const render = template(readFileSync("./prometheus.template.yml").toString());
    const config = merge(...(map(files, (f) => require(resolve(f)))));
    
    if (isEmpty(config.nodes)) {
        return console.error("Missing requred config field: nodes");
    }

    if (isEmpty(config.vchains)) {
        return console.error("Missing requred config field: vchains");
    }

    const result = render(config);    
    console.log(result)    
}

yargs
  .command("prometheus-config", "generates config for Prometheus", (yargs) => {
    yargs.array("config").required("config")
  }, (argv) => {
    generateConfig(argv.config);
  })
  .argv
