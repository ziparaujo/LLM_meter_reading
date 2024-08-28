  import express from "express";
  import UploadController from "../controllers/uploadController.js";

  const routes = express.Router();

  routes.post("/upload", UploadController.cadastrarImagem);

  export default routes;