import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "SilkScreen, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // body: {
        //   cursor: "url('../cursorCross.svg') 32 32, auto",
        // },
      },
    },
  },
});

export default theme;
