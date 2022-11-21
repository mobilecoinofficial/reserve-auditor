# FROM mobilecoin/builder-install:latest
FROM mobilecoin/builder-install:v0.0.19 AS builder

ARG \
	RUST_BACKTRACE=1 \
	SGX_MODE=HW \
	IAS_MODE=DEV

WORKDIR /tmp
COPY . .

RUN cargo build -p mc-reserve-auditor --release

FROM mobilecoin/runtime-base:sha-6f1c083

COPY --from=builder /tmp/target/release/mc-reserve-auditor /usr/local/bin/mc-reserve-auditor
