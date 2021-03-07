import React, { useState, useEffect } from 'react'
import axios from "axios"
import { Box, Button, FormControl, FormHelperText, TextField, Typography } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab';

type Building = {
  id: number,
  name: string
}

type Room = {
  id: number,
  name: string,
  description: string
}

type Asset = {
  id: number,
  name: string,
  description: string
}

/**
 * Overall this is a very inefficienct component, should be re-written for optimal 
 * data fetching for a production environment, including utilizing redux as a global state store.
 */
const CreateReport = () => {
  // Holds all the assets for the asset search box
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  const [topAsset, setTopAsset] = useState<Asset | null>();

  // Available buildings, rooms, assets based upon searches
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

  // Values for input building, room, and asset
  const [building, setBuilding] = useState<Building | null>();
  const [room, setRoom] = useState<Room | null>();
  const [asset, setAsset] = useState<Asset | null>();

  const [roomKey, setRoomKey] = useState(true)
  const [assetKey, setAssetKey] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/buildings').then((res) => setAvailableBuildings(res.data))
    axios.get('http://localhost:5000/assets').then((res) => setAllAssets(res.data))
  }, [])

  const handleBuildingChange = (e: any, newValue: Building | null) => {
    if (newValue !== building) {
      setRoomKey(!roomKey) // re-render to clear
      setAssetKey(!assetKey) // re-render to clear
      setAvailableRooms([]);
      setAvailableAssets([]);
    }
    setBuilding(newValue)
    if (newValue)
      axios.get(`http://localhost:5000/building/${newValue.id}`).then((res) => setAvailableRooms(res.data.rooms))
  }

  const handleRoomChange = (e: any, newValue: Room | null) => {
    if (newValue !== room) {
      setAssetKey(!assetKey) // re-render to clear
      setAvailableAssets([]);
    }
    setRoom(newValue)
    if (newValue)
      axios.get(`http://localhost:5000/room/${newValue.id}`).then((res) => setAvailableAssets(res.data.assets))
  }

  const handleAssetChange = (e: any, newValue: Asset | null) => {
    setAsset(newValue)
  }


  return (
    <div>
      <Box flexDirection="column" mb={2}>
        <Typography variant="h6">Search by Asset ID</Typography>

        <Box mb={1} mt={1} flexDirection="column">
          <FormControl style={{ paddingRight: 10 }}>
            {/* <Autocomplete options={allAssets} getOptionLabel={(option) => option.name} /> */}
            <Autocomplete
              id="combo-box-demo"
              options={allAssets}
              getOptionLabel={(option) => `[${option.name}] ${option.description}`}
              style={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Asset ID" variant="outlined" />}
              autoHighlight
              onChange={(e, val) => setTopAsset(val)}
              value={topAsset}
            />
            <FormHelperText>Search for the asset</FormHelperText>
          </FormControl>
        </Box>
        <Button variant="contained" color="primary" disabled={!topAsset}>Create Fault Report</Button>
      </Box>

      <Box flexDirection="column">
        <Typography variant="h6">Pick Building</Typography>
        <Box mb={1} mt={1}>
          <FormControl>
            <Autocomplete
              id="combo-box-demo"
              options={availableBuildings}
              getOptionLabel={(option) => `${option.name}`}
              style={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Building Name" variant="outlined" />}
              onChange={handleBuildingChange}
              value={building}
              autoHighlight
            />
            <FormHelperText>Search for the building</FormHelperText>
          </FormControl>
        </Box>
        <Box mb={2}>
          <FormControl>
            <Autocomplete
              id="combo-box-demo"
              options={availableRooms}
              getOptionLabel={(option) => `[${option.name}] ${option.description}`}
              style={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Room Name" variant="outlined" />}
              onChange={handleRoomChange}
              value={room}
              key={roomKey ? "room-1" : "room-0"}
              autoHighlight
            />
            <FormHelperText>Search for the room</FormHelperText>
          </FormControl>
        </Box>
        <Box mb={2}>
          <FormControl>
            <Autocomplete
              id="combo-box-demo"
              options={availableAssets}
              getOptionLabel={(option) => `[${option.name}] ${option.description}`}
              style={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Asset Name" variant="outlined" />}
              onChange={handleAssetChange}
              value={asset}
              key={assetKey ? "asset-1" : "asset-0"}
              autoHighlight
            />
            <FormHelperText>Search for the asset</FormHelperText>
          </FormControl>
        </Box>
        <Button variant="contained" color="primary" disabled={!asset}>Create Fault Report</Button>
      </Box>
    </div>
  )
}

export default CreateReport

