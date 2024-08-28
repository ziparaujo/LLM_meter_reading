import express from "express";
import upload from "./uploadRoutes.js";

const routes = (app) => {
  // app.route("/").get((req, res) => res.status(200).send("shopper node.js"));

  app.use(express.json(), upload)
}

export default routes;