#!/bin/bash

set -e pipefail

starttime=$(date +%s)

# enter test-network directory, ensure its down, then join peer to channel
pushd ../fabric-samples/test-network

# Test Network Structure
# channel: "myChannel"
# peer1: 
# peer2:
# orderer:

./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn basic -ccp ../../chaincode -ccl typescript


popd

cat <<EOF

Total Setup time : $(($(date +%s) - starttime)) secs ...

EOF