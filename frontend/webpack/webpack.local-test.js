const { DefinePlugin } = require('webpack')

module.exports = {
  devtool: 'cheap-module-source-map',
  plugins: [
    new DefinePlugin({
      BLOCK_EXPLORER_URL: JSON.stringify(
        'https://block-explorer.test.mobilecoin.com'
      ),
      AUDITOR_URL: JSON.stringify('http://localhost:8080'),
      GNOSIS_SAFE_API_URL: JSON.stringify(
        'https://safe-transaction-goerli.safe.global'
      ),
      ETHERSCAN_URL: JSON.stringify('https://goerli.etherscan.io'),
      MC_NETWORK: JSON.stringify('testnet'),
    }),
  ],
}
