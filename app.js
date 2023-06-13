const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/test", (req, res) => res.json({ test: "OK" }));

const server = app.listen(port, () =>
  console.log(`App listening on port ${port}!`)
);
