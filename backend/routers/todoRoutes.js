const express = require("express");
const mongoose = require("mongoose");
const Todo = require("../models/Todo");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    return res.status(200).json(todos);
  } catch (error) {
    return res.status(500).json({ message: "할일 조회 실패" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "유효하지 않은 할일 ID입니다." });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "할일을 찾을 수 없습니다." });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "할일 조회 실패" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "할일 내용을 입력해주세요." });
    }

    const todo = await Todo.create({ content: content.trim() });
    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "할일 저장 실패" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "유효하지 않은 할일 ID입니다." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "수정할 할일 내용을 입력해주세요." });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "할일을 찾을 수 없습니다." });
    }

    return res.status(200).json(updatedTodo);
  } catch (error) {
    return res.status(500).json({ message: "할일 수정 실패" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "유효하지 않은 할일 ID입니다." });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "할일을 찾을 수 없습니다." });
    }

    return res.status(200).json({ message: "할일이 삭제되었습니다." });
  } catch (error) {
    return res.status(500).json({ message: "할일 삭제 실패" });
  }
});

module.exports = router;
