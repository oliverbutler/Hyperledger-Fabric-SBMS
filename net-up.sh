#!/bin/bash

# Create the test network + channel
cd ./fabric-samples/test-network
./network.sh up createChannel -ca

# Deploy the chaincode to the network
./network.sh deployCC -ccn basic -ccp ../../chaincode -ccl javascript