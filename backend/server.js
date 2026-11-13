const { validateDatabase } = require("./services/validateDatabase");
const express = require("express");
const cors = require("cors");

const reactionRoutes = require("./routes/reactions");
const quizRoutes = require("./routes/quizzes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Chemistry World API",
    status: "online",
    version: "1.0.0"
  });
});

app.use("/api/reactions", reactionRoutes);
app.use("/api/quizzes", quizRoutes);
validateDatabase();
app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" 🧪 CHEMISTRY WORLD REACTION ENGINE");
  console.log("======================================");
  console.log(` Backend: http://localhost:${PORT}`);
  console.log(` Status : ONLINE`);
  console.log("======================================");
  console.log("");
});
