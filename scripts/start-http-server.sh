SGX_MODE=HW IAS_MODE=PROD CONSENSUS_ENCLAVE_CSS=$(pwd)/../mobilecoin/consensus-enclave.css \
MC_LOG=mc_reserve_auditor=info cargo run --release \
    -p mc-reserve-auditor -- \
    start-http-server \
    --gnosis-safe-config ../gnosis-safe.json \
    --reserve-auditor-db ~/Documents/data/auditor-db \