import React from "react";
import { Box, Typography, Grid } from "@mui/material";
const InfoSection = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh", // Full height
        backgroundColor: "#58BDD7", // Background color
        color: "white", // Text color
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // Center content vertically
        p: 2, // Padding
        boxSizing: "border-box", // Include padding in height calculation
      }}
    >
      <Typography
        fontFamily="SilkScreen"
        gutterBottom
        marginTop="0px"
        align="center"
        sx={{
          color: "#FCEE0A",
          fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
        }}
      >
        Parading Ideas, Igniting Futures
      </Typography>
      <Grid
        container
        spacing={4}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              backgroundColor: "#121211", // Slightly transparent background
              borderRadius: "8px",
              padding: 2,
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // Center content vertically
              textAlign: "center", // Center text
            }}
          >
            <Typography
              variant="h6"
              fontFamily="SilkScreen"
              sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } }}
            >
              Description
            </Typography>
            <Typography
              fontWeight="500"
              fontFamily="monospace"
              sx={{ fontSize: { xs: "1rem", sm: "0.7rem", md: "1rem" } }}
            >
              Welcome to Avalanche 2024—the ultimate technical event for Gitians! This year, prepare for an unforgettable experience packed with exciting opportunities to showcase your skills and creativity. From presenting groundbreaking research in paper presentations to battling it out in Robo Mania, testing your knowledge in tech quizzes, and engaging in thought-provoking debates, Avalanche 2024 has something for every tech enthusiast. Take on the challenge of our intense hackathon, meet fellow innovators, and immerse yourself in a community driven by a shared passion for technology. Let’s shape the future together!
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)", // Slightly transparent background
              borderRadius: "8px",
              padding: 2,
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // Center content vertically
              textAlign: "center", // Center text
            }}
          >
            {/* <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" } }}
            >
              Watch Our Promo Video
            </Typography> */}
            <Box
              component="iframe"
              src="https://www.youtube.com/embed/K8g1peDIR04"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                flex: 1,
              }}
            ></Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InfoSection;
