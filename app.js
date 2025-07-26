const express = require("express");
const eventRoutes = require('./src/routes/eventRoutes');
const app = express();
const PORT = 3000;
app.use(express.json());

// Routes
app.use('/api', eventRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!", message: err.message });
});

app.listen(PORT, ()=>{
    console.log(`Calendar Conflict Detection API running at http://localhost:${PORT}`);
})
