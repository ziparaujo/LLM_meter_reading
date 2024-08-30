import mongoose from "mongoose";

const base64Regex = /^([0-9a-zA-Z+/]{4})*([0-9a-zA-Z+/]{2}==|[0-9a-zA-Z+/]{3}=)?$/;

const uploadSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  image: { 
    type: String, 
    validate: {
      validator: function(value) {
        return base64Regex.test(value);
      },
      message: props => `${props.value} is not a valid base64 string.`
    },
    required: [true, "Image is required."]
  },
  customer_code: { type: String, required: true },
  measure_datetime: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !isNaN(value.getTime());
      },
      message: props => `${props.value} is not a valid date.`
    },
    required: [true, "Measure datetime is required."] 
  },
  measure_type: { 
    type: String,
    enum: {
      values: ["WATER", "GAS"],
      message: "{VALUE} is not supported. Valid options are WATER or GAS."
    },
    required: [true, "Measure type is required."]
  },
  has_confirmed: { type: Boolean },
  image_url: { type: String }
}, { versionKey: false });

const upload = mongoose.model("leituras", uploadSchema);

export default upload;