const { DefinePlugin } = require('webpack')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: 'source-map',
  plugins: [
    // new BundleAnalyzerPlugin(),
    new DefinePlugin({
      BLOCK_EXPLORER_URL: JSON.stringify(
        'https://block-explorer.test.mobilecoin.com'
      ),
      AUDITOR_URL: JSON.stringify('https://auditor.test.mobilecoin.com/api/'),
      GNOSIS_SAFE_API_URL: JSON.stringify(
        'https://safe-transaction-goerli.safe.global'
      ),
      ETHERSCAN_URL: JSON.stringify('https://goerli.etherscan.io'),
      MC_NETWORK: JSON.stringify('testnet'),
    }),
  ],
}
