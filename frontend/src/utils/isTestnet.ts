export default function isTestnet() {
  // MC_NETWORK is set as a global var via webpack
  if (typeof MC_NETWORK !== 'undefined') {
    if (MC_NETWORK == 'testnet') {
      return true
    }
  }

  return false
}
