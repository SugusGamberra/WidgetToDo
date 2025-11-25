const { ipcRenderer } = require('electron');

const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskTitle = document.getElementById('new-task-title');
const newTaskSubject = document.getElementById('new-task-subject');

// CARGAR TAREAS
async function loadTasks() {
    const tasks = await ipcRenderer.invoke('get-tasks');
    renderTasks(tasks);
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <span class="task-subject">${task.subject || ''}</span>
            </div>
            <button class="delete-btn">🗑️</button>
        `;
        
        const checkbox = taskElement.querySelector('input');
        checkbox.addEventListener('change', async () => {
            await ipcRenderer.invoke('toggle-task', task.id);
            loadTasks();
        });

        const deleteBtn = taskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if(confirm('¿Borrar?')) {
                await ipcRenderer.invoke('delete-task', task.id);
                loadTasks();
            }
        });

        taskList.appendChild(taskElement);
    });
}

// AÑADIR TAREA (SIMPLE)
addTaskBtn.addEventListener('click', async () => {
    const title = newTaskTitle.value.trim();
    const subject = newTaskSubject.value.trim();
    
    if (!title) return;
    
    const originalText = addTaskBtn.textContent;
    addTaskBtn.textContent = "⏳";
    
    await ipcRenderer.invoke('add-task', title, subject);
    
    newTaskTitle.value = '';
    newTaskSubject.value = '';
    addTaskBtn.textContent = "Añadir";
    
    setTimeout(() => loadTasks(), 1000);
    newTaskTitle.focus();
});

// ENTER PARA ENVIAR
newTaskTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTaskBtn.click();
});
newTaskSubject.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTaskBtn.click();
});

// INICIO
loadTasks();

// LATIDO
setInterval(() => {
    const isTyping = document.activeElement === newTaskTitle || 
                        document.activeElement === newTaskSubject;
    if (!isTyping) {
        loadTasks();
    }
}, 10000);