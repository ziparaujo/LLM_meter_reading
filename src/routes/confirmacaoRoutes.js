import express from "express";
import confirmacaoController from "../controllers/confirmacaoController.js";

const routes = express.Router();

routes.patch("/confirm/:uuid", confirmacaoController.confirmarValor);

export default routes;