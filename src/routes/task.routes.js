import { Router } from "express";
import { getTasks, createTask, deleteTask, updateTask, getTask, markTaskAsCompleted,
  searchTasksByCarPlate, searchTasksByClientName, searchTasksByPhone,
  searchTasksByOrderNumber, backupTasks } from "../controllers/task.controller.js";
import { authRequired } from "../middlewares/validateTokens.js";

const router = Router();

router.get('/tasks', authRequired, getTasks);
router.post('/tasks', authRequired, createTask);
router.get('/tasks/search', searchTasksByCarPlate);
router.get('/tasks/search/name', searchTasksByClientName);
router.get('/tasks/search/phone', searchTasksByPhone);
router.get('/tasks/search/order', searchTasksByOrderNumber);
router.get('/tasks/backup', authRequired, backupTasks);
router.get('/tasks/:id', authRequired, getTask);
router.delete('/tasks/:id', authRequired, deleteTask);
router.put('/tasks/:id', authRequired, updateTask);
router.put('/tasks/:id/complete', authRequired, markTaskAsCompleted);

export default router;
