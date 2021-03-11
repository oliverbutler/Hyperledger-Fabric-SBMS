#!/bin/bash

FABRIC_CFG_PATH=$(pwd)/sampleconfig

# create the channel ch1
peer channel create -o 127.0.0.1:7050 --outputBlock $(pwd)/artifacts/ch1.block -c ch1 -f $(pwd)/artifacts/ch1.tx

# join the peer to the channel ch1
peer channel join -b $(pwd)/artifacts/ch1.block