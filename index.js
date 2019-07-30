const { readFileSync } = require("fs");
const { template, merge } = require("lodash");

const render = template(readFileSync("./prometheus.template.yml").toString());
const config = merge(require("./config.json"), {
    nodes: [
        {
            name: "Orbs Demo 1",
            host: "node1.demonet.orbs.com"
        },
        {
            name: "Orbs Demo 2",
            host: "node2.demonet.orbs.com"
        },
        {
            name: "Orbs Demo 3",
            host: "node3.demonet.orbs.com"
        },
        {
            name: "Orbs Demo 4",
            host: "node4.demonet.orbs.com"
        }
    ],
    vchains: [
        1000
    ]
});

const result = render(config);

console.log(result)