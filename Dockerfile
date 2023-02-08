ARG MOBILECOIND_BASE_TAG=v4.0.2-test
FROM mobilecoin/mobilecoind:${MOBILECOIND_BASE_TAG} AS mobilecoind

FROM mobilecoin/builder-install:v0.0.19 AS builder

ARG \
	RUST_BACKTRACE=1 \
	SGX_MODE=HW \
	IAS_MODE=DEV
WORKDIR /build
COPY . .
RUN cargo build -p mc-reserve-auditor --release

FROM mobilecoin/runtime-base:sha-6f1c083
COPY --from=builder /build/target/release/mc-reserve-auditor /usr/local/bin/mc-reserve-auditor
COPY --from=mobilecoind /usr/bin/mobilecoind /usr/bin/mobilecoind

CMD ["/usr/bin/supervisord", "-n"]
