#!/bin/bash


# InitLedger
# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["InitLedger"]}'

# GetAllReports
CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode query -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["GetAllReports"]}' 

# Get Report 2
# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode query -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["GetReport", "2"]}' 

# GetReportHistory
# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode query -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["GetReportHistory", "2"]}' 

# Delete Report
# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["DeleteReport", "1"]}' 

# Approve Report 
# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["ApproveReport", "2", "problem fixed", "1"]}' 

# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["DenyReport", "2", "they lied!!", "true"]}' 


# ---------------------------------------------------------------------------- #
#                                   Reportees                                  #
# ---------------------------------------------------------------------------- #

# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["CreateReportee", "1"]}' 

# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode invoke -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["UpdateScore", "1", "5", "2"]}' 

# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode query -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["GetAllReportees"]}' 

# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode query -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["GetReporteeHistory", "1"]}' 

# CORE_PEER_ADDRESS=127.0.0.1:8051 peer chaincode query -o 127.0.0.1:8050 -C ch1 -n mycc -c '{"Args":["ReporteeExists", "1"]}' 