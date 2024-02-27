const { DefinePlugin } = require('webpack')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: 'source-map',
  plugins: [
    // new BundleAnalyzerPlugin(),
    new DefinePlugin({
      AUDITOR_URL: JSON.stringify(
        'https://auditor.stage.test.mobilecoin.com/api/'
      ),
      BLOCK_EXPLORER_URL: JSON.stringify(
        'https://block-explorer.test.mobilecoin.com'
      ),
      GNOSIS_SAFE_API_URL: JSON.stringify(
        'https://safe-transaction-sepolia.safe.global'
      ),
      ETHERSCAN_URL: JSON.stringify('https://sepolia.etherscan.io'),
      MC_NETWORK: JSON.stringify('testnet'),
    }),
  ],
}
