  import express from "express";
  import UploadController from "../controllers/uploadController.js";

  const routes = express.Router();

  routes.post("/upload", UploadController.cadastrarImagem);
  routes.get("/:customer_code/list", UploadController.buscaImagens);

  export default routes;