import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import React, { SyntheticEvent, useEffect, useState } from "react";
// @ts-ignore
import assetsCsv from "../data/assets.csv";
import Papa from "papaparse";
import { dataRequest, steps } from "../constants/constants";
import "./StepForm.scss";

type InfoType = "populationDensity" | "droneRestriction";
type AssetType = {
  ID: string;
  Latitude: number;
  Longitude: number;
  Name: string;
  Type: string;
};
function StepForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [assets, setAssets] = useState<AssetType[]>();
  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [infoType, seTinfoType] = useState<InfoType | "">("");
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const parseAssets = async () => {
      Papa.parse(assetsCsv, {
        download: true,
        header: true,
        dynamicTyping: true,
        delimiter: "",
        complete: (result) => {
          setAssets(result.data as AssetType[]);
        },
      });
    };
    parseAssets();
  }, []);

  const handleNext = async () => {
    if (
      activeStep === 1 &&
      infoType &&
      selectedAsset?.Longitude &&
      selectedAsset?.Latitude
    ) {
      const link = `https://api3.geo.admin.ch/rest/services/api/MapServer/identify?layers=all:ch.${dataRequest[infoType]}&geometryType=esriGeometryPoint&sr=4326&lang=en&returnGeometry=false&tolerance=0&geometry={"x": ${selectedAsset?.Longitude}, "y": ${selectedAsset?.Latitude}}`;
      const response = await fetch(link);
      const data = await response.json();
      setResultData(data);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    if (activeStep === 2) {
      setActiveStep(0);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChangeInfoType = (event: SelectChangeEvent) => {
    seTinfoType(event.target.value as InfoType);
  };

  const handleAssets = (
    event: SyntheticEvent<Element, Event>,
    value: AssetType | null
  ) => {
    setSelectedAsset(value);
  };

  const isStepDisabled = (): boolean => {
    switch (activeStep) {
      case 0:
        return infoType ? false : true;
      case 1:
        return selectedAsset ? false : true;
      case 2:
        return false;
      default:
        throw new Error("Unknown step");
    }
  };

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return (
          <Typography sx={{ mt: 2, mb: 1 }}>
            Please select whether you want to retrieve information about drone
            restrictions or population density.
            <FormControl fullWidth sx={{ mt: 2, mb: 1 }}>
              <InputLabel id="infoType">Info type</InputLabel>
              <Select
                labelId="infoType"
                id="infoType"
                value={infoType}
                label="Info type"
                onChange={handleChangeInfoType}
              >
                <MenuItem value={"populationDensity"}>
                  Population Density
                </MenuItem>
                <MenuItem value={"droneRestriction"}>
                  Drone Restriction
                </MenuItem>
              </Select>
            </FormControl>
          </Typography>
        );
      case 1:
        return (
          <Typography sx={{ mt: 2, mb: 2 }}>
            Please an asset from the provided data dump.
            <FormControl fullWidth sx={{ mt: 2, mb: 1 }}>
              <Autocomplete
                value={selectedAsset}
                onChange={(e, value) => handleAssets(e, value)}
                disablePortal
                id="combo-box-demo"
                options={assets || []}
                getOptionLabel={(option) =>
                  option?.Name +
                  "   lat: " +
                  option?.Latitude +
                  "   long: " +
                  option?.Longitude
                }
                renderInput={(params) => (
                  <TextField {...params} label="Assets" />
                )}
              ></Autocomplete>
            </FormControl>
          </Typography>
        );
      case 2:
        return (
          <div>
            <Typography sx={{ mt: 2, mb: 1 }}>Result</Typography>
            {resultData && (
              <pre className="result-content">
                {JSON.stringify(resultData, null, 2)}
              </pre>
            )}
          </div>
        );
      default:
        throw new Error("Unknown step");
    }
  }

  return (
    <div className="step-form-wrapper">
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <React.Fragment>
          <Typography sx={{ mt: 5, mb: 1 }}>
            Step {activeStep + 1}
            {getStepContent(activeStep)}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext} disabled={isStepDisabled()}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      </Box>
    </div>
  );
}

export default StepForm;

