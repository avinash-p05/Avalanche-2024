import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  IconButton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {Instagram, Twitter, LinkedIn, GitHub, WhatsApp} from "@mui/icons-material";
import Footer from "../../components/Footer/Footer";
import { styled, keyframes } from "@mui/material/styles";
import avinash from "../../assets/avinash.jpg";
import ganesh from "../../assets/ganesh.jpg";
import niraj from "../../assets/niraj2.jpg";
import manoj from "../../assets/manoj3.webp";

// Animations and Styled Components
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px #4fc3dc, 0 0 25px #58BDD7; }
  50% { box-shadow: 0 0 25px #4fc3dc, 0 0 50px #58BDD7; }
  100% { box-shadow: 0 0 5px #4fc3dc, 0 0 25px #58BDD7; }
`;

const rotateBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const DeveloperCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  padding: theme.spacing(1.5),
  transition: "all 0.3s ease-in-out",
  position: "relative",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  animation: `${float} 6s ease-in-out infinite`,
  width: "100%",
  maxWidth: "280px",
  margin: "0 auto",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(225deg, #ff3cac 0%, #784ba0 50%, #2b86c5 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease-in-out",
    zIndex: 0,
    animation: `${rotateBackground} 3s ease infinite`,
    backgroundSize: "200% 200%",
  },
}));

const ProfileImage = styled("img")({
  width: "130px",
  height: "130px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #58BDD7",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  zIndex: 1,
  animation: `${glowPulse} 2s infinite`,
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: "white",
  background: "rgba(255, 255, 255, 0.1)",
  margin: theme.spacing(0.5),
  transition: "all 0.3s ease-in-out",
  position: "relative",
  zIndex: 1,
  "&:hover": {
    background: "#58BDD7",
    transform: "translateY(-3px)",
  },
}));

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000",
      paper: "rgba(255, 255, 255, 0.05)",
    },
  },
  typography: {
    fontFamily: '"SilkScreen", sans-serif',
    h2: {
      fontSize: "3rem",
      fontWeight: 500,
      backgroundColor: "#58BDD7",
      backgroundClip: "text",
      textFillColor: "transparent",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
});



// Reusable component for rendering team member cards
const TeamSection = ({ title, members, socialOptions }) => (
  <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
    <Typography
      variant="h2"
      align="center"
      sx={{
        mb: 8,
        textTransform: "uppercase",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "350px",
          height: "4px",
          background: "#58BDD7",
        },
      }}
    >
      {title}
    </Typography>
    <Grid
      container
      spacing={3}
      justifyContent="center"
      alignItems="center"
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {members.map((member, index) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          lg={3}
          key={index}
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <DeveloperCard
            sx={{
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <ProfileImage src={member.image} alt={member.name} />
              <Typography
                variant="h6"
                sx={{
                  mt: 3,
                  mb: 1,
                  color: "white",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {member.name}
              </Typography>
              <Typography
                fontSize="1.2rem"
                sx={{
                  mt: 0,
                  mb: 1,
                  color: "#FCEE0A",
                  fontWeight: 400,
                  textAlign: "center",
                }}
              >
                {member.phone}
              </Typography>

              <Box>
                {socialOptions.instagram && member.socials?.instagram && (
                  <SocialButton href={member.socials.instagram} target="_blank">
                    <Instagram />
                  </SocialButton>
                )}
                {socialOptions.linkedin && member.socials?.linkedin && (
                  <SocialButton href={member.socials.linkedin} target="_blank">
                    <LinkedIn />
                  </SocialButton>
                )}
              </Box>
            </Box>
          </DeveloperCard>
        </Grid>
      ))}
    </Grid>
  </Container>
);

const developers = [
  {
    name: "Avinash Pauskar",
    image: avinash,
    phone: "+91 9008500585",
    socials: {
      instagram: "https://www.instagram.com/avinashh.5/",
      twitter: "https://wa.me/+919008500585",
      linkedin: "https://linkedin.com/in/avinash-pauskar",
      github: "https://github.com/avinash-p05",
    },
  },

  {
    name: "Ganesh Kugaji",
    phone: "+91 7204917202",
    image: ganesh,
      socials: {
      instagram: "https://www.instagram.com/kugajiganesh/",
      twitter: "https://wa.me/+917204917202",
      linkedin: "https://www.linkedin.com/in/ganesh-kugaji05/",
      github: "https://github.com/Ganes5h/",
    },
  },
  {
    name: "Niraj Vernekar",
    phone: "+91 8217787117",
    image: niraj,
        socials: {
      instagram: "https://www.instagram.com/nirajvernekar02/",
      twitter: "https://wa.me/+918217787117",
      linkedin: "https://www.linkedin.com/in/niraj-vernekar-691875196/",
      github: "https://github.com/nirajvernekar02",
    },
  },
  {
    name: "Manoj Patil",
    phone: "+91 6363678375",
    image: manoj,
        socials: {
      instagram: "https://www.instagram.com/mpaantoijl/",
      twitter: "https://wa.me/+916363678375",
      linkedin: "https://www.linkedin.com/in/mpaantoijl/",
      github: "https://github.com/9147",
    },
  },
];

const DevelopersSection = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "#121211",
          minHeight: "100vh",
          py: 10,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)",
            top: 0,
            left: 0,
          },
        }}
      >
        {/* Animated Background Dots */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: "10px",
                height: "10px",
                background: "#FCEE0A",
                borderRadius: "50%",
                animation: `${float} ${Math.random() * 8 + 4}s linear infinite`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3,
              }}
            />
          ))}
        </Box>

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 8,
              textTransform: "uppercase",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "350px",
                height: "4px",
                background: "#58BDD7",
              },
            }}
          >
            Technical Team
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="center"
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              flexWrap: { xs: "wrap", lg: "nowrap" },
            }}
          >
            {developers.map((dev, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                lg={3}
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <DeveloperCard
                  sx={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <ProfileImage src={dev.image} alt={dev.name} />
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 3,
                        mb: 1,
                        color: "white",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {dev.name}
                    </Typography>
                    <Typography
                      fontSize="1.2rem"
                      sx={{
                        mt: 0,
                        mb: 1,
                        color: "#FCEE0A",
                        fontWeight: 400,
                        textAlign: "center",
                      }}
                    >
                      {dev.phone}
                    </Typography>

                    <Box>
                      <SocialButton href={dev.socials.twitter} target="_blank">
                      <WhatsApp />
                    </SocialButton>
                      <SocialButton
                        href={dev.socials.instagram}
                        target="_blank"
                      >
                        <Instagram />
                      </SocialButton>

                      <SocialButton href={dev.socials.linkedin} target="_blank">
                        <LinkedIn />
                      </SocialButton>
                      <SocialButton href={dev.socials.github} target="_blank">
                        <GitHub />
                      </SocialButton>
                    </Box>
                  </Box>
                </DeveloperCard>
              </Grid>
            ))}
          </Grid>
        </Container>
        
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default DevelopersSection;
