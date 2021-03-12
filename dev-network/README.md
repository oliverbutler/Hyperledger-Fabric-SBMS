# Hyperledger Fabric SBMS

This is a project created as part of my 3rd year dissertation

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

### Approve the Chaincode

In another window approve the chaincode

```
./approveChaincode.sh
```

### Build and start the chaincode

For TS/JS we can just run it, use this command in the chaincode directory to initialize it.

```
CORE_CHAINCODE_LOGLEVEL=debug CORE_PEER_TLS_ENABLED=false CORE_CHAINCODE_ID_NAME=mycc:1.0 npm run start -- --peer.address=127.0.0.1:7052
```

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
