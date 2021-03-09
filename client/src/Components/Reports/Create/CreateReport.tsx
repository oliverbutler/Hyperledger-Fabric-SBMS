import React, { useState, useEffect } from "react";
import clsx from "clsx";
import axios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  makeStyles,
  TextareaAutosize,
  TextField,
  Typography,
} from "@material-ui/core";
import { Alert, AlertTitle, Autocomplete } from "@material-ui/lab";

// Icons
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { green } from "@material-ui/core/colors";

type Building = {
  id: number;
  name: string;
};

type Room = {
  id: number;
  name: string;
  description: string;
};

type Asset = {
  id: number;
  name: string;
  description: string;
};

type Damage = {
  id: number;
  name: string;
};

type User = {
  id: number;
  userCode: string;
  givenName: string;
  familyName: string;
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

/**
 * Overall this is a very inefficienct component, should be re-written for optimal
 * data fetching for a production environment, including utilizing redux as a global state store.
 */
const CreateReport = () => {
  const classes = useStyles();

  // Holds all the assets for the asset search box
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  const [topAsset, setTopAsset] = useState<Asset | null>();

  // Available buildings, rooms, assets based upon searches
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [availableDamage, setAvailableDamage] = useState<Damage[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Values for input building, room, and asset
  const [building, setBuilding] = useState<Building | null>();
  const [room, setRoom] = useState<Room | null>();
  const [asset, setAsset] = useState<Asset | null>();

  const [roomKey, setRoomKey] = useState(true);
  const [assetKey, setAssetKey] = useState(true);

  // Form Values, ideally migrate to react-hook-form for production
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>();
  const [selectedUser, setSelectedUser] = useState<User | null>();
  const [selectedDamage, setSelectedDamage] = useState<Damage | null>();
  const [description, setDescription] = useState<string>();

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/buildings")
      .then((res) => setAvailableBuildings(res.data));
    axios
      .get("http://localhost:5000/assets")
      .then((res) => setAllAssets(res.data));
    axios
      .get("http://localhost:5000/damages")
      .then((res) => setAvailableDamage(res.data));
    axios
      .get("http://localhost:5000/users")
      .then((res) => setAvailableUsers(res.data));
  }, []);

  const handleBuildingChange = (e: any, newValue: Building | null) => {
    if (newValue !== building) {
      setRoomKey(!roomKey); // re-render to clear
      setAssetKey(!assetKey); // re-render to clear
      setAvailableRooms([]);
      setAvailableAssets([]);
    }
    setBuilding(newValue);
    if (newValue)
      axios
        .get(`http://localhost:5000/building/${newValue.id}`)
        .then((res) => setAvailableRooms(res.data.rooms));
  };

  const handleRoomChange = (e: any, newValue: Room | null) => {
    if (newValue !== room) {
      setAssetKey(!assetKey); // re-render to clear
      setAvailableAssets([]);
    }
    setRoom(newValue);
    if (newValue)
      axios
        .get(`http://localhost:5000/room/${newValue.id}`)
        .then((res) => setAvailableAssets(res.data.assets));
  };

  const handleAssetChange = (e: any, newValue: Asset | null) => {
    setAsset(newValue);
  };

  // Asset Damage Submission

  const handleUserChange = (e: any, newValue: User | null) => {
    setSelectedUser(newValue);
  };

  const handleDamageChange = (e: any, newValue: Damage | null) => {
    setSelectedDamage(newValue);
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleFaultSubmit = () => {
    setSubmitLoading(true);

    axios
      .post("http://localhost:5000/reports", {
        assetId: selectedAsset?.id,
        reporteeId: selectedUser?.id,
        damageId: selectedDamage?.id,
        description: description,
      })
      .then((res) => {
        console.log(res);
        setSubmitLoading(false);
        setSuccess(true);
      });
  };

  return (
    <div>
      <Collapse in={!selectedAsset}>
        <Box flexDirection="column" mb={2}>
          <Typography variant="h6">Search by Asset ID</Typography>

          <Box mb={1} mt={1} flexDirection="column">
            <FormControl style={{ paddingRight: 10 }}>
              {/* <Autocomplete options={allAssets} getOptionLabel={(option) => option.name} /> */}
              <Autocomplete
                id="combo-box-demo"
                options={allAssets}
                getOptionLabel={(option) =>
                  `[${option.name}] ${option.description}`
                }
                style={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Asset ID" variant="outlined" />
                )}
                autoHighlight
                onChange={(e, val) => setTopAsset(val)}
                value={topAsset}
              />
              <FormHelperText>Search for the asset</FormHelperText>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="primary"
            disabled={!topAsset}
            onClick={() => setSelectedAsset(topAsset)}
          >
            Create Fault Report
          </Button>
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Building Name"
                    variant="outlined"
                  />
                )}
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
                getOptionLabel={(option) =>
                  `[${option.name}] ${option.description}`
                }
                style={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Room Name" variant="outlined" />
                )}
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
                getOptionLabel={(option) =>
                  `[${option.name}] ${option.description}`
                }
                style={{ width: 300 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Asset Name"
                    variant="outlined"
                  />
                )}
                onChange={handleAssetChange}
                value={asset}
                key={assetKey ? "asset-1" : "asset-0"}
                autoHighlight
              />
              <FormHelperText>Search for the asset</FormHelperText>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="primary"
            disabled={!asset}
            onClick={() => setSelectedAsset(asset)}
          >
            Create Fault Report
          </Button>
        </Box>
      </Collapse>
      <Collapse in={!!selectedAsset && !success}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setSelectedAsset(null)}
        >
          <ArrowBackIcon /> Change Asset
        </Button>
        <Box mt={2}>
          <Typography variant="h6">
            {selectedAsset?.name} - {selectedAsset?.description}
          </Typography>
          <Box mb={2} mt={2}>
            <FormControl>
              <Autocomplete
                options={availableUsers}
                getOptionLabel={(option) =>
                  `[${option.userCode}] ${option.givenName} ${option.familyName}`
                }
                style={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="User" variant="outlined" />
                )}
                key={assetKey ? "user-1" : "user-0"}
                onChange={handleUserChange}
                value={selectedUser}
                autoHighlight
              />
              <FormHelperText>
                What user to submit the request as
              </FormHelperText>
            </FormControl>
          </Box>
          <Box mb={2}>
            <FormControl>
              <Autocomplete
                id="combo-box-demo"
                options={availableDamage}
                getOptionLabel={(option) => `${option.name}`}
                style={{ width: 300 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Damage Type"
                    variant="outlined"
                  />
                )}
                key={assetKey ? "damage-1" : "damage-0"}
                onChange={handleDamageChange}
                value={selectedDamage}
                autoHighlight
              />
              <FormHelperText>What type of damage</FormHelperText>
            </FormControl>
          </Box>
          <Box mb={2}>
            <FormControl>
              <TextField
                label="Damage"
                multiline
                rowsMax={4}
                variant="outlined"
                onChange={handleDescriptionChange}
                value={description}
              />
              <FormHelperText>Description of the Damage</FormHelperText>
            </FormControl>
          </Box>
        </Box>
        <div className={classes.root}>
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              color="primary"
              disabled={
                !selectedAsset ||
                !selectedUser ||
                !selectedDamage ||
                !description ||
                submitLoading
              }
              onClick={handleFaultSubmit}
            >
              Submit Fault Report
            </Button>
            {submitLoading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </div>
      </Collapse>
      <Collapse in={success}>
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          Fault Report successfully added, go to the fault reports page to see
        </Alert>
      </Collapse>
    </div>
  );
};

export default CreateReport;
