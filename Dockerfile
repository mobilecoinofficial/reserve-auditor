ARG MOBILECOIND_BASE_TAG=v4.1.0-test
FROM mobilecoin/mobilecoind:${MOBILECOIND_BASE_TAG} AS mobilecoind

FROM mobilecoin/builder-install:v0.0.17 AS builder

WORKDIR /build
ARG NETWORK=test

RUN CONSENSUS_SIGSTRUCT_URI=$(curl -s https://enclave-distribution.${NETWORK}.mobilecoin.com/production-v4.0.0.json | jq .consensus.sigstruct | tr -d \") && curl -O "https://enclave-distribution.${NETWORK}.mobilecoin.com/${CONSENSUS_SIGSTRUCT_URI}"

ARG \
  RUST_BACKTRACE=1 \
  SGX_MODE=HW \
  IAS_MODE=PROD \
  CONSENSUS_ENCLAVE_CSS=/build/consensus-enclave.css


COPY . .
RUN cargo build -p mc-reserve-auditor --release

FROM mobilecoin/runtime-base:sha-09062b2

ENV CONSENSUS_ENCLAVE_CSS=/measurement/consensus-enclave.css

COPY --from=builder /build/target/release/mc-reserve-auditor /usr/local/bin/mc-reserve-auditor
COPY --from=builder /build/consensus-enclave.css /measurement/consensus-enclave.css
COPY --from=mobilecoind /usr/bin/mobilecoind /usr/bin/mobilecoind

CMD ["/usr/bin/supervisord", "-n"]
