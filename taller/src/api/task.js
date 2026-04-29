import axios from "./axios";

// export const getTasksRequest = () => axios.get(`/tasks`);
export const getTasksRequest = () => 
    axios.get(`/tasks`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

export const getTaskRequest = (id) => axios.get(`/tasks/${id}`);

// export const createTaskRequest = (task) => axios.post(`/tasks`, task);
export const createTaskRequest = (task) => 
    axios.post(`/tasks`, task, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

export const updateTaskRequest = (task) => axios.put(`/tasks/${task.id}`, task);

export const deleteTaskRequest = (id) => axios.delete(`/tasks/${id}`);