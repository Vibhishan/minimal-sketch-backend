import express from "express";
import cors from "cors";
import config from "./configs/index.js";

const app = express();

app.use(
  cors({
    origin: config.corsOptions.origin,
    methods: config.corsOptions.methods,
    credentials: config.corsOptions.credentials,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log(req);
  console.log(res);
  res.status(200).json({
    message: "API is working",
    status: "OK",
  });
});

export default app;
