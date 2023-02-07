FROM mobilecoin/builder-install:v0.0.19 AS builder

ARG \
	RUST_BACKTRACE=1 \
	SGX_MODE=HW \
	IAS_MODE=DEV
WORKDIR /build
COPY . .
RUN cargo build -p mc-reserve-auditor --release

ARG MOBILECOIND_BASE=mobilecoin/mobilecoind:v3.0.0-test
FROM $MOBILECOIND_BASE as mobilecoind

FROM mobilecoin/runtime-base:sha-6f1c083
COPY --from=builder /build/target/release/mc-reserve-auditor /usr/local/bin/mc-reserve-auditor
COPY --from=mobilecoind /usr/bin/mobilecoind /usr/bin/mobilecoind

ARG REPO_ORG=mobilecoin
ARG BASE_TAG=latest
FROM ${REPO_ORG}/runtime-base:${BASE_TAG}

CMD ["/usr/bin/supervisord"]
