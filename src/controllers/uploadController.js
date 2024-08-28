import upload from "../models/Upload.js";

class UploadController {

  static async cadastrarImagem (req, res) {
    try {
      // const response = req.body
      // const data = new Date(response.measure_datetime)
      // const ano = data.getMonth() + 1
      // const teste = await upload.findOne({measure_type: response.measure_type}).exec();
      // if(teste === null) {
      //   res.status(500).json( { message: `${erro.message} - null teste null` });
      // }

      const novaImagem = await upload.create(req.body);
      res.status(201).json({ 
        message: "Operação realizada com sucesso",
        // image_url: novaImagem.image,
        // measure_value: measureValue,
        measure_uuid: novaImagem._id,
        // teste: teste.measure_datetime,
        // responde: ano
       }) 
    } catch (erro) {
      res.status(500).json( { message: `${erro.message} - falha ao cadastrar nova imagem` });
    }
  }

};

export default UploadController;