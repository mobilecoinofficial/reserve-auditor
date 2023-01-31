const { DefinePlugin } = require('webpack')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: 'source-map',
  plugins: [
    // new BundleAnalyzerPlugin(),
    new DefinePlugin({
      AUDITOR_URL: JSON.stringify('https://reserve-auditor.test.mobilecoin.com/api/'),
      GNOSIS_SAFE_API_URL: JSON.stringify('https://safe-transaction.goerli.gnosis.io'),
      ETHERSCAN_URL: JSON.stringify('https://goerli.etherscan.io'),
    })
  ]
}
