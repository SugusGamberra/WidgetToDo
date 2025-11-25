const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const userDataPath = app.getPath('userData');
const tasksPath = path.join(userDataPath, 'tasks.json');

function ensureFileExists() {
    if (!fs.existsSync(tasksPath)) {
        try {
            fs.writeFileSync(tasksPath, '[]', 'utf8');
            console.log('Archivo de tareas creado en:', tasksPath);
        } catch (error) {
            console.error('No se pudo crear el archivo inicial:', error);
        }
    }
}

function getTasks() {
    ensureFileExists();
    try {
        const data = fs.readFileSync(tasksPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo tareas:', error);
        return [];
    }
}

function saveTasks(tasks) {
    try {
        fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error guardando tareas:', error);
        return false;
    }
}

function toggleTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        return task;
    }
    return null;
}

function addTask(title, subject) {
    const tasks = getTasks();
    const newTask = {
        id: Date.now().toString(),
        title: title,
        subject: subject || 'Sin asignatura',
        completed: false
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

function deleteTask(taskId) {
    const tasks = getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    saveTasks(filteredTasks);
    return true;
}

module.exports = { getTasks, saveTasks, toggleTask, addTask, deleteTask };