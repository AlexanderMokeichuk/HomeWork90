import {Grid} from "@mui/material";
import Canvas from "./Canvas/Canvas";

function App() {
  return (
    <Grid container justifyContent={"center"} alignItems={"center"} height={"100vh"}>
      <Canvas />
    </Grid>
  );
}

export default App;
