const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const useragent = require("express-useragent");
const fs = require("fs");

const config = require("./config");
const logger = require('./modules/winston');

const {
  expressErrorLogger,
  expressLogger,
} = require("./modules/express-winston");
const errorResponseHandler = require("./modules/error-response-handler");

const app = express();

app.use(bodyParser.json());
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(useragent.express());
app.use(expressLogger);

app.get("/test", (req, res) => res.json({ test: "OK" }));

fs.readdirSync("./api/routes/")
  .filter((e) => {
    return e.endsWith(".js");
  })
  .forEach((file) => {
    let name = file.substring(0, file.length - 3);
    name = name == "index" ? "" : name;
    app.use("/api/" + name, require("./api/routes/" + name));
  });

// app.use((req, res) => {
//   res.redirect("/");
// });

app.use(expressErrorLogger);
app.use(errorResponseHandler);

mongoose
  .connect(config.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    logger.info("Connected to mongodb");
    return app.listen(config.port);
  })
  .then((server) => {
    logger.info(`Server listening on port ${config.port}`);
  })
  .catch((error) => {
    logger.error(error);
  });
