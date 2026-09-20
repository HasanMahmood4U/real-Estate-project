const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "namma-nivas-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));

// Demo user
// Email: admin@nammanivas.com
// Password: Namma@123

const users = [
    {
        id: 1,
        name: "Namma Nivas User",
        email: "admin@nammanivas.com",
        passwordHash:
            "$2b$10$wH5q5VJj5p8J7Vj8vYQmEukx7v3V5V5G3W5Qq4rQ8fW7Xv6Zz8N5K"
    }
];

// Login API
app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const validPassword = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!validPassword) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    res.json({
        success: true,
        message: "Login successful"
    });
});


// Check whether user is logged in
app.get("/api/me", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            loggedIn: false
        });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });
});


// Logout
app.post("/api/logout", (req, res) => {

    req.session.destroy(() => {
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });

});


// Protect home page
app.get("/home", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login.html");
    }

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});


app.listen(PORT, () => {
    console.log(`Namma-Nivas running at http://localhost:${PORT}`);
});