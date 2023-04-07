cd ../mobilecoin
SGX_MODE=HW IAS_MODE=PROD CONSENSUS_ENCLAVE_CSS=$(pwd)/consensus-enclave.css \
MC_LOG=debug,rustls=warn,hyper=warn,tokio_reactor=warn,mio=warn,want=warn,rusoto_core=error,h2=error,reqwest=error \
        cargo run --release -p mc-mobilecoind -- \
        --ledger-db ~/Documents/data/ledger-db/ \
        --watcher-db ~/Documents/data/watcher-db/ \
        --mobilecoind-db ~/Documents/mobilecoind-db/ \
        --poll-interval 1 \
        --peer mc://node1.prod.mobilecoinww.com/ \
        --peer mc://node2.prod.mobilecoinww.com/ \
        --tx-source-url https://ledger.mobilecoinww.com/node1.prod.mobilecoinww.com/ \
        --tx-source-url https://ledger.mobilecoinww.com/node2.prod.mobilecoinww.com/ \
        --listen-uri insecure-mobilecoind://127.0.0.1:4444/ \
        --chain-id main
cd ../scripts