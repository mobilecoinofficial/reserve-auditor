MC_LOG=mc_reserve_auditor=info cargo run --release \
    -p mc-reserve-auditor -- \
    start-http-server \
    --gnosis-safe-config ../gnosis-safe.json \
    --reserve-auditor-db /tmp/auditor-db \