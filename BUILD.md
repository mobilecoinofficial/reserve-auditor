# Create a local ledger for the mobilecoin network:

1. download the mobilecoin submodule (`git submodule update --init --recursive` from the base of the repo)
2. change into the scripts directory (`cd scripts` from the base of the repo)
3. download the css files for the network you're planning to use (`sh get-testnet-consensus-css.sh` for testnet). You will need to redownload the appropriate css file when switching networks, but otherwise need to run this only once.
4. start up the mobilecoind application to create a local mobilecoin ledger (`sh mobilecoind-testnet.sh` for testnet).
5. Wait for the application to finish syncing.

# Create a local database for the reserve auditor:

(if following from the previous section, open a new command line window for the following steps)
1. Copy the contents of the network's config file into the base config file (`cp testnet.gnosis-safe.json gnosis-safe.json` from the base of the repo for testnet)
2. Navigate to the scripts directory within the reserve-auditor repo (`cd scripts` from the base of the repo)
3. Start up the Ledger Scanning Layer (`sh start-scanning-layer.sh`)
4. Wait for the scanning layer to finish scanning the mobilecoin local ledger

# Run the http server:

(if following from the previous section, open a new command line window for the following steps)
1. (skip if performed in previous section) Copy the contents of the network's config file into the base config file (`cp testnet.gnosis-safe.json gnosis-safe.json` from the base of the repo for testnet)
2. Navigate to the scripts directory within the reserve-auditor repo (`cd scripts` from the base of the repo)
3. Start up the Http Server (`sh start-http-server.sh`)

# Run the front end:

(if following from the previous section, open a new command line window for the following steps)
1. (skip if already installed) Install Yarn (`npm install yarn`)
2. Navigate to the frontend directory within the reserve-auditor repo (`cd frontend` from the base of the repo)
3. Download the required packages (`yarn` from the frontend directory)
4. Start the front end (`yarn start-testnet` for testnet). Alternate starting and building commands can be found within the `frontend/package.json` file.