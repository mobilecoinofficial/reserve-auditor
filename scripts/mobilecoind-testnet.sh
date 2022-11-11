cd ../mobilecoin
SGX_MODE=HW IAS_MODE=PROD CONSENSUS_ENCLAVE_CSS=$(pwd)/consensus-enclave.css \
MC_LOG=debug,rustls=warn,hyper=warn,tokio_reactor=warn,mio=warn,want=warn,rusoto_core=error,h2=error,reqwest=error \
        cargo run --release -p mc-mobilecoind -- \
        --ledger-db /tmp/ledger-db/ \
        --watcher-db /tmp/watcher-db/ \
        --mobilecoind-db /tmp/mobilecoind-db/ \
        --poll-interval 1 \
        --peer mc://node1.test.mobilecoin.com/ \
        --peer mc://node2.test.mobilecoin.com/ \
        --tx-source-url https://s3-us-west-1.amazonaws.com/mobilecoin.chain/node1.test.mobilecoin.com/ \
        --tx-source-url https://s3-us-west-1.amazonaws.com/mobilecoin.chain/node2.test.mobilecoin.com/ \
        --listen-uri insecure-mobilecoind://127.0.0.1:4444/ \
        --chain-id Test
cd ../scripts