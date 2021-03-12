#!/bin/bash
CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":[]}' --isInit

# Create
# CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode invoke -o 127.0.0.1:7050 -C ch1 -n mycc -c '{"function":"CreateAsset","Args":["asset8","blue","16","Kelley","750"]}'

# GetAllAssets
# CORE_PEER_ADDRESS=127.0.0.1:7051 peer chaincode query -o 127.0.0.1:7050 -C ch1 -n mycc -c '{"Args":["GetAllAssets"]}' 

# peer chaincode query -C ch1 -n mycc -c '{"Args":["GetAllAssets"]}' 
# peer chaincode invoke -C ch1 -n mycc -c '{"function":"CreateAsset","Args":["asset8","blue","16","Kelley","750"]}'

# Run Chaincode FROM chaincode dir
# CORE_CHAINCODE_LOGLEVEL=debug CORE_PEER_TLS_ENABLED=false CORE_CHAINCODE_ID_NAME=mycc:1.0 npm run start -- --peer.address=127.0.0.1:7052