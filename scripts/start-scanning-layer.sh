SGX_MODE=HW IAS_MODE=PROD CONSENSUS_ENCLAVE_CSS=$(pwd)/../mobilecoin/consensus-enclave.css \
MC_LOG=mc_reserve_auditor=info cargo run --release \
    -p mc-reserve-auditor -- \
    scan-ledger \
    --gnosis-safe-config ../gnosis-safe.json \
    --ledger-db /tmp/ledger-db \
    --reserve-auditor-db /tmp/auditor-db \
    --watcher-db /tmp/watcher-db/ \