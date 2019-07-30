# Prometheus metrics collector

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
./index.js prometheus-config --config config.json --config topology.json --config ./example-config/vchains.example.json > prometheus.yml
```
