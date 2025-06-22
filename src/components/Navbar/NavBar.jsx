import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, logout } from "../../store/authSlice";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { ListItemButton } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.png";

const drawerWidth = 240;

export default function DrawerAppBar(props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    // Close drawer helper function
    const closeDrawer = () => {
        setMobileOpen(false);
    };

    // Handle navigation and close drawer
    const handleNavigation = (route) => {
        navigate(route);
        closeDrawer();
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/register-login");
        closeDrawer();
    };

    const navItems = [
        { name: "Home", route: "/" },
        { name: "COMPETITIONS", route: "/competitions" },
        { name: "RULEBOOK", route: "/rulebook" },
        { name: "CONTACT", route: "/contact" },
        ...(isAuthenticated ? [{ name: "PROFILE", route: "/profile" }] : []),
        {
            name: isAuthenticated ? "Logout" : "Login",
            route: isAuthenticated ? "/" : "/register-login",
            action: isAuthenticated ? handleLogout : null,
        },
    ];

    const drawer = (
        <Box
            onClick={handleDrawerToggle}
            sx={{ textAlign: "center", pt: 3, backgroundColor: "black", minHeight: "100vh" }}
        >
            <img src={Logo} alt="No Logo" width={80} />
            <Typography variant="h5" sx={{ my: 2, color: "#58BDD7" }}>
                Avalanche
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the drawer's onClick from firing
                                if (item.action) {
                                    item.action();
                                } else {
                                    handleNavigation(item.route);
                                }
                            }}
                            sx={{
                                textAlign: "center",
                                color: location.pathname === item.route ? "yellow" : "white",
                                "&:hover": { color: "yellow" },
                            }}
                        >
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const container = window ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                component="nav"
                sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    zIndex: 1200,
                }}
            >
                <Toolbar sx={{ justifyContent: "center", display: "flex" }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            display: { sm: "none" },
                            position: "absolute",
                            top: 10,
                            left: 10,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: { xs: "none", sm: "flex" } }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.name}
                                onClick={() => {
                                    if (item.action) item.action();
                                    else handleNavigation(item.route);
                                }}
                                sx={{
                                    color: location.pathname === item.route ? "yellow" : "white",
                                    "&:hover": { color: "yellow" },
                                    fontSize: "1rem",
                                    mx: 2,
                                }}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    anchor="left"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            backgroundColor: "transparent",
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    );
}