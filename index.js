const express = require("express");
const app = express();
const port = 8782;

app.get("/", (req, res) => {
  res.send("Server running!");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
