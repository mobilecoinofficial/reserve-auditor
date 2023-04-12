const { DefinePlugin } = require('webpack')

module.exports = {
  devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      AUDITOR_URL: JSON.stringify(
        'https://auditor.stage.main.mobilecoin.com/api/'
      ),
      BLOCK_EXPLORER_URL: JSON.stringify(
        'https://block-explorer.mobilecoin.foundation'
      ),
      GNOSIS_SAFE_API_URL: JSON.stringify(
        'https://safe-transaction-mainnet.safe.global'
      ),
      ETHERSCAN_URL: JSON.stringify('https://etherscan.io'),
    }),
  ],
}
