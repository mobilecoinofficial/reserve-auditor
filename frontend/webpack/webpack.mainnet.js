const { DefinePlugin } = require('webpack')

module.exports = {
  devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      AUDITOR_URL: JSON.stringify('https://auditor.eusd.one/api'),
      GNOSIS_SAFE_API_URL: JSON.stringify('https://safe-transaction-mainnet.safe.global'),
      ETHERSCAN_URL: JSON.stringify('https://etherscan.io'),
    })
  ]
}
