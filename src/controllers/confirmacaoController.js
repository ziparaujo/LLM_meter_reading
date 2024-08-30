import confirmacao from "../models/Confirmacao.js";
import upload from "../models/Upload.js";

class confirmacaoController {
  
  static async confirmarValor (req, res) {
    try {
      
      const id = req.params.uuid;
      const confirmacaoBanco = await confirmacao.findOne({ measure_uuid: id });

      if(!confirmacaoBanco) {
        return res.status(404).json({
          error_code: "MEASURE_NOT_FOUND",
          error_description: "Leitura não encontrada"
        });
      };

      if(id != req.body.measure_uuid) {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "O uuid informado no corpo da requisição é diferente do uuid buscado"
        });
      };

      if(confirmacaoBanco.has_confirmed) {
        return res.status(409).json({
          error_code: "CONFIRMATION_DUPLICATE",
          error_description: "Leitura do mês já realizada"
        });
      };

      await confirmacao.findOneAndUpdate({ measure_uuid: id }, { ...req.body, has_confirmed: true });
      await upload.findByIdAndUpdate(id, { has_confirmed: true });

      res.status(200).json({ success: true });

    } catch (erro) {
      res.status(400).json( { error_code: "INVALID_DATA", error_description: `${erro.message}` });
    };
  };

};

export default confirmacaoController;