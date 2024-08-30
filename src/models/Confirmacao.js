import mongoose from "mongoose";

const confirmacaoSchema = new mongoose.Schema({
  measure_uuid: { type: String, required: [true, "Measure uuid is required."] },
  confirmed_value: { type: Number },
  has_confirmed: { type: Boolean }
}, { versionKey: false });

const confirmacao = mongoose.model("confirmado", confirmacaoSchema);

export default confirmacao;