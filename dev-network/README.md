# Dev Network

The intensions of this network was to work from the dev-network while developping to allow for faster development as running the peer in devmode allows for instant chaincode reloading (+ easy logging!). This network was created from following https://github.com/samlinux/htsc/blob/master/meetup-290121/fabric2DevModeDockerEdition.md tutorial from samlinux for Hyperledger. The network works perfectly, _however_ I am currently unaware how to run the NodeJS application from this dev-network, there is no (apparent) wallet.

## Prerequesites

To run this you will need to clone the fabric repo into the root project directory (../), run the make commands to build some of the dependencies my below scripts utilize

## Setup the dev-network

### Build the Artifacts

```
./buildArtifacts.sh
```

### Start the peer & orderer

```
docker-compose up
```

### Create and Join Channel

```
./createChannel.sh
```

### Build and start the chaincode

For TS/JS we can just run it, use this command in the chaincode directory to initialize it.

```
CORE_CHAINCODE_LOGLEVEL=debug CORE_PEER_TLS_ENABLED=false CORE_CHAINCODE_ID_NAME=mycc:1.0 npm run start -- --peer.address=127.0.0.1:8052
```

### Approve the Chaincode

In another window approve the chaincode

```
./approveChaincode.sh
```

### Initialze/test Chaincode (dont skip!)

then you must initialize the chaincode

```
./initChaincode.sh
```

### Done!

You may now run applications against the chaincode.

### Upgrade Chaincode

To upgrade the chaincode simply stop and start it as needed.

### Stop the network

Stop the docker-compose window, then run

```
./cleanUp.sh
```

to delete the blockchain/artifacts
