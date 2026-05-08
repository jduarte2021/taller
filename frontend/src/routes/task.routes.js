import { Router } from 'express'
import { authRequired } from '../middlewares/validateTokens.js'
import { getTasks, getTask, createTask, updateTask, deleteTask, searchTasksByCarPlate,searchTasksByClientName,markTaskAsCompleted } from '../controllers/task.controller.js'
import { validateSchema } from '../middlewares/validator.middleware.js'
import { createTaskSchema } from '../schemas/task.schema.js'


const router = Router()

router.get('/tasks/search', authRequired, searchTasksByCarPlate);
router.get('/tasks/search/name',authRequired, searchTasksByClientName);
router.get('/tasks', authRequired, getTasks)
router.get('/tasks/:id', authRequired, getTask)
router.post('/tasks', authRequired, validateSchema(createTaskSchema), createTask)
router.delete('/tasks/:id', authRequired, deleteTask)
router.put('/tasks/:id', authRequired, updateTask)
router.put('/tasks/:id/complete', markTaskAsCompleted);



export default router

