#!/bin/bash

set -e pipefail

# start localcouchdb
docker run --publish 5990:5984 --detach --name localcouchdb -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb
docker start localcouchdb 