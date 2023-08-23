import React from "react";
import "./App.css";
import StepForm from "./components/StepForm";
import { Box, Container } from "@mui/material";

function App() {
  return (
    <div className="App">
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" justifyContent="center">
          <StepForm></StepForm>
        </Box>
      </Container>
    </div>
  );
}

export default App;
