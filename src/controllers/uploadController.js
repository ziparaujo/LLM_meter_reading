import upload from "../models/Upload.js";
import confirmacao from "../models/Confirmacao.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class UploadController {

  static async cadastrarImagem (req, res) {
    try {
      const response = req.body
      const image = response.image
      const dadoIgual = await upload.findOne({measure_type: response.measure_type}).exec();
      
      let dataEncontrada;
      let mes;
      let dataDoReqAtual = new Date(response.measure_datetime).getMonth() + 1;
      if(dadoIgual) {
        dataEncontrada = new Date(dadoIgual.measure_datetime);
        mes = dataEncontrada.getMonth() + 1;
      }

      if(mes == dataDoReqAtual) {
        res.status(409).json({ "error_code": "DOUBLE_REPORT", "error_description": "Leitura do mês já realizada" })
      } else {

        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const filePath = path.join(uploadPath, `${Date.now()}.png`);
        await fs.promises.writeFile(filePath, base64Data, 'base64');
        const fileLink = `/uploads/${path.basename(filePath)}`;

        console.log('fileLink', fileLink)

        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
        const uploadResult = await fileManager.uploadFile(`./src/controllers${fileLink}`, {
          mimeType: "image/png",
          displayName: "Uploaded Image",
        });

        console.log('uploadResult', uploadResult)

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
          "Tell me about this image.",
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ]);

        const novaImagem = await upload.create({
          ...req.body,
          image_url: fileLink,
          measure_value: result.response.text(),
          has_confirmed: false
        });

        await confirmacao.create({
          measure_uuid: novaImagem._id,
          confirmed_value: 0
        });

        res.status(201).json({ 
          image_url: fileLink,
          measure_value: result.response.text(),
          measure_uuid: novaImagem._id,
         }) 
      }
    } catch (erro) {
      if(erro.name == "ValidationError") {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        })
      }
      res.status(400).json( { error_code: "INVALID_DATA", error_description: `${erro.message}` });
    }
  }

  static async buscaImagens (req, res) {
    try {
      const customer_code = req.params.customer_code;
      const measure_type = req.query.measure_type;
      let filtro = { customer_code: customer_code };
      let dados;

      if(measure_type) {
        filtro.measure_type = measure_type;
        if(measure_type != "WATER" && measure_type != "GAS") {
          return res.status(400).json({
            error_code: "INVALID_TYPE",
            error_description: "Tipo de medição não permitida"
          });
        };
      };

      const imagemBanco = await upload.find(filtro);

      if(!imagemBanco || imagemBanco.length == 0) {
        return res.status(404).json({
          error_code: "MEASURES_NOT_FOUND",
          error_description: "Nenhuma leitura encontrada"
        })
      }

      const retorno = imagemBanco.map((item) => {
        return {
          measure_uuid: item._id,
          measure_datetime: item.measure_datetime,
          measure_type: item.measure_type,
          has_confirmed: item.has_confirmed,
          image_url: item.image_url
        }
      })

      if(imagemBanco.length != 0)  {
        dados = {
          customer_code: customer_code,
          measures: [...retorno]
        }
      }

      res.status(200).json(dados)

    } catch (erro) {
      res.status(400).json( { error_code: "INVALID_DATA", error_description: `${erro.message}` });
    }
  }

  static async deletarImagem (req, res) {
    try {
      const id = req.params.id;
      await upload.findByIdAndDelete(id);
      res.status(201).json({ message: "leitura deletada com sucesso" })
    } catch (erro) {
      res.status(400).json( { error_code: "INVALID_DATA", error_description: `${erro.message}` });
    }
  }

};

export default UploadController;