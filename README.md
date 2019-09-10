# Kartoha

🥔 is a Prometheus config generator that helps to collect metrics from every virtual chain on Orbs blockchain.

## Usage

The following steps generate `prometheus-config.yml`:

* Create a new config file. Here we use `config.json`, but you can use any filename
* Copy into your file the Prometheus authentication section template from `example-config/config.example.json`
* Populate the Prometheus authentication settings
* Copy into your file the network topology template from `example-config/demonet.example.json`
* Populate `nodes` and `vchains` sections
* Your file should have this structure:
```
{
  "prometheus": {
    "url": "some_url",
    "username": "some_user",
    "password": "<password_or_api_key>"
  },
  "nodes": [
    {
      "name": "Orbs Demo 1",
      "host": "node1.demonet.orbs.com"
    },
    {
      "name": "Orbs Demo 2",
      "host": "node2.demonet.orbs.com"
    },
    {
      "name": "Orbs Demo 3",
      "host": "node3.demonet.orbs.com"
    },
    {
      "name": "Orbs Demo 4",
      "host": "node4.demonet.orbs.com"
    }
  ],
  "vchains": [
    1000
  ]
}
``` 
* Run:
```sh
./index.js prometheus-config --config config.json > prometheus.yml
``` 
* This generates `prometheus.yml`

## Authentication settings

Save your Graphana settings to `config.json` (follow example from `example-config/config.example.json`). You will need:

- Remote Prometheus URL
- Username
- Password

## Monitoring production

Retrieve topology from Ethereum:

```sh
./index.js topology --topology-contract-address 0x804c8336846d8206c95CEe24752D514210B5a240 --validator-registry-contract-address 0x56a6895fd37f358c17cbb3f14a864ea5fe871f0a --ethereum-endpoint http://eth.orbs.com > topology.json
```

Scrap data from vchain 10000000:

```sh
./index.js prometheus-config --config config.json --config topology.json --config ./example-config/vchains.example.json > prometheus.yml
```

Run Prometheus:

```sh
docker run -d --name prometheus --restart always -p 9090:9090 -v `pwd`/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

## Monitoring demonet

```sh
./index.js prometheus-config --config config.json --config ./example-config/demonet.example.json > prometheus.yml
```

## Grafana dashboard

You can import the dashboard from here: `grafana/dashboard.json`
