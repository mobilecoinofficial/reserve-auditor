CONSENSUS_ENCLAVE_CSS=$(pwd)/consensus-enclave.css \
MC_LOG=mc_reserve_auditor=info cargo run --release \
    -p mc-reserve-auditor -- \
    scan-ledger \
    --gnosis-safe-config ../gnosis-safe.json \
    --ledger-db /tmp/ledger-db \
    --reserve-auditor-db /tmp/auditor-db \
    --watcher-db /tmp/watcher-db/ \