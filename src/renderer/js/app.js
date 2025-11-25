const { ipcRenderer } = require('electron');

const closeBtn = document.getElementById('close-btn');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskTitle = document.getElementById('new-task-title');
const newTaskSubject = document.getElementById('new-task-subject');

// Botón de cerrar
closeBtn.addEventListener('click', () => {
    window.close();
});

// Cargar tareas
async function loadTasks() {
    try {
        const tasks = await ipcRenderer.invoke('get-tasks');
        
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<p class="loading">No hay tareas</p>';
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <div class="task-info">
                    <span class="task-title">${task.title}</span>
                    <span class="task-subject">${task.subject}</span>
                </div>
                <button class="delete-btn" data-id="${task.id}">🗑️</button>
            `;
            
            // marcar/desmarcar
            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async () => {
                await ipcRenderer.invoke('toggle-task', task.id);
                loadTasks();
            });
            
            // eliminar
            const deleteBtn = taskElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                if (confirm('¿Seguro que quieres eliminar esta tarea?')) {
                    await ipcRenderer.invoke('delete-task', task.id);
                    loadTasks();
                }
            });
            
            taskList.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Error cargando tareas:', error);
        taskList.innerHTML = '<p class="loading">Error al cargar tareas</p>';
    }
}

// nueva tarea
addTaskBtn.addEventListener('click', async () => {
    const title = newTaskTitle.value.trim();
    const subject = newTaskSubject.value.trim();
    
    if (!title) {
        alert('Por favor escribe un título para la tarea');
        return;
    }
    
    await ipcRenderer.invoke('add-task', title, subject);
    
    // Limpiar campos
    newTaskTitle.value = '';
    newTaskSubject.value = '';
    
    // Recargar tareas
    loadTasks();

    //devolver foco para seguir escribiendo
    newTaskTitle.focus();
});

// añadir con Enter
newTaskTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

newTaskSubject.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

// Cargar al iniciar
loadTasks();