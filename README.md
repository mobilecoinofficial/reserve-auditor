## reserve-auditor

- Production Mainnet: [auditor.mobilecoin.foundation](https://auditor.mobilecoin.foundation)
- Production Testnet: [auditor.test.mobilecoin.com](https://auditor.test.mobilecoin.com)
- Staging Mainnet: [auditor.stage.main.mobilecoin.com](https://auditor.stage.main.mobilecoin.com)
- Staging Testnet: [auditor.stage.test.mobilecoin.com](https://auditor.stage.test.mobilecoin.com)

This is a service which provides a gRPC API for auditing mints and burns on the MobileCoin blockchain, and optionally correlating them with deposits and withdrawals on a [Gnosis Safe](https://gnosis-safe.io/).

The reserve auditor stores its audit information in a SQLite database, and provides a gRPC for querying this database.
It also provides some Prometheus metrics to ease automated monitoring.

### Running the reserve auditor

Full use of the Reserve Auditor requires a local ledger of the mobilecoin network, a scanning layer to ingest the contents of the local ledger, an http server to serve the results to http://localhost:3000, and a front end to visualize the data. See BUILD.md for more information

### Gnosis Safe Auditing

The reserve auditor supports syncing data from a Gnosis safe. It uses the [Gnosis transaction service API](https://github.com/safe-global/safe-transaction-service/) to get the data. This service is operated by Gnosis, and is available for [ETH main net](https://safe-transaction-mainnet.safe.global/) and [Sepolia, an ETH test net](https://safe-transaction-sepolia.safe.global/).

Mints on the MobileCoin blockchain are expected to correlate with a deposit to a safe. The expected process is:

1. A deposit of the appropriate backing token is made to the safe using a standard Ethereum transaction.
2. A MintTx is then submitted to the MobileCoin blockchain, embedding the deposit transaction hash in the nonce of the
   MobileCoin MintTx. The nonce allows linking the MobileCoin mint to the Gnosis safe deposit.

Similarly, burns on the MobileCoin blockchain are expected to correlate with a withdrawal from a safe. The expected process is:

1. A transaction on the MobileCoin blockchain that moves the desired token to the burn address is issued.
2. A [batched transaction](https://help.gnosis-safe.io/en/articles/4680071-transaction-builder) is issued to the Ethereum blockchain. The batched transaction needs to contain two transactions:
   1. A transaction that moves the desired token out of the safe
   1. A transaction to an auxiliary contract (see more details below) that is used to link withdrawal to the MobileCoin burn.

Gnosis deposits are easily linked to the matching MobileCoin mints via the Ethereum transaction hash. Linking withdrawals is more difficult since standard Ethereum transactions do not have a way of including metadata. In an ideal world we would've had the option of including the MobileCoin burn transaction TxOut public key in the Ethereum withdrawal transaction, but there is no easy way to do that.
The solution we came up with is to deploy an "auxiliary contract", who has a single function that accepts arbitrary metadata bytes, and use that as part of a Gnosis batched transfer to include extra data in addition to the token transfer. Such contract can be seen [here](https://github.com/tbrent/ethereum-metadata) and is [deployed to the Sepolia network]https://sepolia.etherscan.io/address/0xF6970481dd09494099b5A2559E05Fa1Db6D6660B).

#### Setting up

The first step is to decide which asset you are going to use on the Ethereum blockchain, and get some ETH (for paying gas fees) and some of this test asset. For testing purposes we have used `seUSD` (Sepolia eUSD) - https://sepolia.etherscan.io/token/0xfdc112c39d0fafa45ec8b2ca9e46dfab43b41575. You need to get some ETH, and some of this asset. Google around to find working faucets.

To play around with Gnosis auditing the first step is to create a safe. This can be done on https://app.safe.global/
Once the safe is created, it will be assigned an address on the Ethereum blockchain. This assumes you have a wallet that your browser can connect to such as [MetaMask](https://metamask.io/). Note that creating a Gnosis Safe requires submitting a transaction to the Ethereum blockchain, so your wallet will need to have some ETH to pay the gas fees.

The Ethereum network you are testing with will need to have the metadata contract deployed. For the Sepolia test network, this was already done and assigned the address `0xF6970481dd09494099b5A2559E05Fa1Db6D6660B`.
You will also need to know the 4 byte signature of the metadata contract `emitBytes` function. For the contract mentioned above, this is `AUX_BURN_FUNCTION_SIG.to_vec()` (since this is derived from the function signature, it should be the same for all unmodified deployments of this contract).

#### Depositing to the safe

Depositing to the safe is as simple as sending a standard Ethereum transaction that moves your desired token (`seUSD` in this example) into the safe's address.

Once the Gnosis transaction service notices the transaction and the auditor syncs it you should see a log message similar to this:
`2022-06-21 20:40:42.785395662 UTC INFO Processing gnosis safe deposit: EthereumTransfer { from: EthAddr("0xdc079a637a1417020916FfB8a39fF5a2801A0F07"), to: EthAddr("0xeC018400FFe5Ad6E0B42Aa592Ee1CF6092972dEe"), token_addr: Some(EthAddr("0xeC76FbFD75481839e456C4cb2cd23cda813f19B1")), tx_hash: EthTxHash("0x744372bb82b2d0f0e7b2722d163ffef97656562b40cc7fad9a1809d14aaf626a"), tx_type: "ERC20_TRANSFER", value: JsonU64(10000000000000000000) }, mc.app: mc-reserve-auditor, mc.module: mc_reserve_auditor::gnosis::sync, mc.src: reserve-auditor/src/gnosis/sync.rs:128`

#### Withdrawing from the safe

Withdrawal is slightly move involved since you will need to construct a multi-transaction that both moves the token out of the safe and transacts with the auxiliary metadata contracts to record the matching MobileCoin burn TxOut public key.

The steps to do that are:

1. On the [Gnosis safe web app](https://app.safe.global/apps/) click `Apps` and then select the `Transaction Builder` application.
2. We will first construct the transaction that moves the `seUSD` token. In the `Enter Address or ENS Name` you need to put the contract address, which for `seUSD` on Sepolia is `0xfdc112c39d0fafa45ec8b2ca9e46dfab43b41575`
3. Under `Enter ABI` you need to put the contract ABI
<details>
  <summary>View Contract</summary>

```json
[
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_upgradedAddress", "type": "address" }],
    "name": "deprecate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "deprecated",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_evilUser", "type": "address" }],
    "name": "addBlackList",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_from", "type": "address" },
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "upgradedAddress",
    "outputs": [{ "name": "", "type": "address" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "balances",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "maximumFee",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "_totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_maker", "type": "address" }],
    "name": "getBlackListStatus",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "", "type": "address" },
      { "name": "", "type": "address" }
    ],
    "name": "allowed",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "paused",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "who", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getOwner",
    "outputs": [{ "name": "", "type": "address" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{ "name": "", "type": "address" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "newBasisPoints", "type": "uint256" },
      { "name": "newMaxFee", "type": "uint256" }
    ],
    "name": "setParams",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "issue",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "redeem",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "basisPointsRate",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "isBlackListed",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_clearedUser", "type": "address" }],
    "name": "removeBlackList",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "MAX_UINT",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_blackListedUser", "type": "address" }],
    "name": "destroyBlackFunds",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_initialSupply", "type": "uint256" },
      { "name": "_name", "type": "string" },
      { "name": "_symbol", "type": "string" },
      { "name": "_decimals", "type": "uint256" }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }],
    "name": "Issue",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }],
    "name": "Redeem",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }],
    "name": "Deprecate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "name": "feeBasisPoints", "type": "uint256" },
      { "indexed": false, "name": "maxFee", "type": "uint256" }
    ],
    "name": "Params",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "name": "_blackListedUser", "type": "address" },
      { "indexed": false, "name": "_balance", "type": "uint256" }
    ],
    "name": "DestroyedBlackFunds",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "_user", "type": "address" }],
    "name": "AddedBlackList",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "name": "_user", "type": "address" }],
    "name": "RemovedBlackList",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "owner", "type": "address" },
      { "indexed": true, "name": "spender", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "from", "type": "address" },
      { "indexed": true, "name": "to", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" },
  { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }
]
```

https://sepolia.etherscan.io/address/0xfdc112c39d0fafa45ec8b2ca9e46dfab43b41575#code contains a `Contract ABI` section that you copy-paste from.

</details>
4. Once you put the contract ABI, under the `Transaction information` section you should be able to select the `transfer` method under `Contract Method Selector`
5. Set `_to` to your destination wallet address. This is the address that will receive the tokens withdrawn from the safe.
6. Set `_value` to the amount to withdraw, for example `1000000000000000000`.
7. Click `Add transaction`. Now that you added the transaction to withdraw the tokens, you need to add the one to the auxiliary metadata contract.
8. Edit the `Enter Address or ENS Name` to contain the address of the auxiliary metadata contract. In Sepolia this is `0xF6970481dd09494099b5A2559E05Fa1Db6D6660B`.
9. For ABI, use:
   ```
   [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"bytes","name":"metadata","type":"bytes"}],"name":"MetadataReceived","type":"event"},{"inputs":[{"internalType":"bytes","name":"metadata","type":"bytes"}],"name":"emitBytes","outputs":[],"stateMutability":"nonpayable","type":"function"}]
   ```
   This is obtained by looking at https://sepolia.etherscan.io/address/0xF6970481dd09494099b5A2559E05Fa1Db6D6660B#writeContract
10. Method will be automatically selected to the only one available - `emitBytes`.
11. `metadata (bytes)` should be 32 hex-encoded bytes (i.e. 64 hex chars) that represents the TxOut public key. For example, put `0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f`.
12. Click `Add transaction`.
13. Now that everything is ready, click `Create Batch` and then `Send Batch`. Once the transaction goes through your wallet should contain the deposit and you should see a log message from the reserve-auditor:
    ```
    2022-06-21 21:11:05.933236816 UTC INFO Processing withdrawal from multi-sig tx: GnosisSafeWithdrawal { id: None, eth_tx_hash: "0x0e781edb7739aa88ad2ffb6a69aab46ff9e32dbd0f0c87e4006a176838b075d2", eth_block_number: 10892902, safe_addr: "0xeC018400FFe5Ad6E0B42Aa592Ee1CF6092972dEe", token_address: "0xeC76FbFD75481839e456C4cb2cd23cda813f19B1", amount: 1000000000000000000, mc_tx_out_public_key_hex: "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f00" }, mc.app: mc-reserve-auditor, mc.module: mc_reserve_auditor::gnosis::sync, mc.src: reserve-auditor/src/gnosis/sync.rs:170
    ```
