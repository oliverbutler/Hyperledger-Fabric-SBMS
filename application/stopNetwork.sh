#!/bin/bash

# Exit on first error
set -ex

# Bring the test network down
pushd ../fabric-samples/test-network
./network.sh down
popd

# clean out any old identites in the wallets
rm -rf ./dist/wallet
# rm -rf addAssets.json mychannel_basic.log mychannel__lifecycle.log nextblock.txt

# docker stop localcouchdb
# docker rm localcouchdb
