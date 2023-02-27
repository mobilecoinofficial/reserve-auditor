const { DefinePlugin } = require('webpack')

module.exports = {
  devtool: 'cheap-module-source-map',
  plugins: [
    new DefinePlugin({
      AUDITOR_URL: JSON.stringify('http://localhost:8080'),
      GNOSIS_SAFE_API_URL: JSON.stringify('https://safe-transaction-mainnet.safe.global'),
      ETHERSCAN_URL: JSON.stringify('https://etherscan.io'),
    })
  ]
}
