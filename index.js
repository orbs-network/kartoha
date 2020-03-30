#!/usr/bin/env node

const { readFileSync } = require("fs");
const { resolve } = require("path");
const { template, merge, isEmpty, map } = require("lodash");
const Web3 = require("web3");
const { Address4 } = require("ip-address");
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
    console.log(result);
}

async function getTopology(ethereumEndpoint, topologyContractAddress, validatorRegistryContractAddress) {
    const web3 = new Web3(new Web3.providers.HttpProvider(ethereumEndpoint));

    const validatorABI = require("./abi/validators.abi.json");
    const validators = new web3.eth.Contract(validatorABI, topologyContractAddress);

    const validatorRegistryABI = require("./abi/validator-registry.abi.json");
    const validatorRegistry = new web3.eth.Contract(validatorRegistryABI, validatorRegistryContractAddress);

    const validatorAddresses = await validators.methods.getValidators().call();
    const data = await Promise.all(validatorAddresses.map(async (addr) => {
        return validatorRegistry.methods.getValidatorData(addr).call();
    }));

    const nodes = data.map(v => {
        return {
            name: v.name,
            host: Address4.fromHex(v.ipAddress.slice(2)).address,
        }
    });

    console.log(JSON.stringify({
        nodes
    }, 2, 2));
}

yargs
  .command("prometheus-config", "generates config for Prometheus", (yargs) => {
    yargs.array("config").required("config")
  }, (argv) => {
    generateConfig(argv.config);
  })
  .command("topology", "get topology from ethereum", (yargs) => {
    yargs
        .string("ethereum-endpoint").required("ethereum-endpoint")
        .string("topology-contract-address").required("topology-contract-address")
        .string("validator-registy-contract-address").required("validator-registry-contract-address")
  }, async (argv) => {
    await getTopology(argv.ethereumEndpoint, argv.topologyContractAddress, argv.validatorRegistryContractAddress);
  })
  .argv
