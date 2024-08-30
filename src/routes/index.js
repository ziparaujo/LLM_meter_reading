import express from "express";
import upload from "./uploadRoutes.js";
import confirmacao from "./confirmacaoRoutes.js";

const routes = (app) => {
  // app.route("/").get((req, res) => res.status(200).send("shopper node.js"));

  app.use(express.json(), upload)
  app.use(express.json(), confirmacao)
}

export default routes;