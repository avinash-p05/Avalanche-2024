import React, { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import Button from "../../components/Button/Button"
import { BsDownload } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import pdf from "../../assets/rulebook.pdf";
import rulebook from "../../assets/rulebookImage.png"; // Assuming your image is PNG - adjust extension as needed
import "./RuleBook.css";
import lottie from "lottie-web";
import Footer from "../../components/Footer/Footer"
const RuleBook = () => {
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);
    const lottieContainer = useRef(null);

    const handleResize = () => {
        setWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const animationInstance = lottie.loadAnimation({
            container: lottieContainer.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "https://lottie.host/b205bc13-cd8f-4ad2-94ad-97d5d61c4440/DfeugOlTFs.json",
        });

        return () => animationInstance.destroy();
    }, []);

    return (
        <>
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",

                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                bgcolor: "#121211",
                p: 3,
                textAlign: "center",
                overflowY: "auto",
            }}
        >
            {/*<Box sx={{ width: 300, height: 300, mb: 3 }} ref={lottieContainer} />*/}


            {/* PDF Container with image */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "800px",
                    mb: 3,
                    minHeight:"100vh",
                    padding: "20px",
                    paddingTop:"60px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    display: "flex",
                    justifyContent:"center",
                    flexDirection: "column",
                    alignItems: "center",
                    overflow: "hidden" // Added to contain the image
                }}
            >


                <img
                    src={rulebook}
                    alt="Rulebook"
                    style={{
                        border:"10px solid white",
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: "4px"
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        marginTop:"20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontSize: "16px",
                        padding: "10px 20px",
                    }}
                    href={pdf}
                    target="_blank"
                    download="Avalanche2024's Rulebook"
                    rel="noopener noreferrer"
                >
                    <BsDownload /> Download Rulebook
                </Button>
            </Box>
        </Box>
            <Footer/>
            </>
    );
};

export default RuleBook;