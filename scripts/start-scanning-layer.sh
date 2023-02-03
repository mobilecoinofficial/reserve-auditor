MC_LOG=mc_reserve_auditor=info cargo run --release \
    -p mc-reserve-auditor -- \
    scan-ledger \
    --gnosis-safe-config ../gnosis-safe.json \
    --ledger-db /Users/colincarey/.mobilecoin/prod/ledger-db \
    --reserve-auditor-db /tmp/auditor-db