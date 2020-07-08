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

async function getTopology(ethereumEndpoint, topologyContractAddress, validatorRegistryContractAddress, port) {
    const web3 = new Web3(new Web3.providers.HttpProvider(ethereumEndpoint));

    const validatorABI = require("./abi/validators.abi.json");
    const validators = new web3.eth.Contract(validatorABI, topologyContractAddress);

    const validatorRegistryABI = require("./abi/validator-registry.abi.json");
    const validatorRegistry = new web3.eth.Contract(validatorRegistryABI, validatorRegistryContractAddress);

    const validatorAddresses = await validators.methods.getValidators().call();
    const data = await Promise.all(validatorAddresses.map(async (addr) => {
        return { ethAddr: addr, data: await validatorRegistry.methods.getValidatorData(addr).call()};
    }));

    const topology = data.map(v => {
        return {
            Name: v.data.name,
            Ip: Address4.fromHex(v.data.ipAddress.slice(2)).address,
            EthAddress: v.ethAddr.slice(2),
            OrbsAddress: v.data.orbsAddress.slice(2),
            Port: port,
        }
    });

    const committee = data.map(v => {
        return {
            Name: v.data.name,
            EthAddress: v.ethAddr.slice(2),
            OrbsAddress: v.data.orbsAddress.slice(2),
            Weight: 1,
            IdentityType: 0,
        }
    });

     console.log(JSON.stringify({
        CurrentTopology : topology, CommitteeEvents: [{RefTime: 0, Committee: committee }]
     }, 2, 2));
    //console.log({CurrentTopology : topology, CommitteeEvents: [{RefTime: 0, Committee: committee }]});
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
        .number("port").required("port")
  }, async (argv) => {
    await getTopology(argv.ethereumEndpoint, argv.topologyContractAddress, argv.validatorRegistryContractAddress, argv.port);
  })
  .argv
