CONSENSUS_ENCLAVE_CSS=$(pwd)/consensus-enclave.css \
MC_LOG=mc_reserve_auditor=info cargo run --release \
    -p mc-reserve-auditor -- \
    scan-ledger \
    --gnosis-safe-config ../gnosis-safe.json \
    --ledger-db ~/Documents/data/ledger-db \
    --reserve-auditor-db ~/Documents/data/auditor-db \
    --watcher-db ~/Documents/data/watcher-db/ \