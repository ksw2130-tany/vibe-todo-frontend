const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "할일 내용을 입력해주세요."],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Todo", todoSchema);
