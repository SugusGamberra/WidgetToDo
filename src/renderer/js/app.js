const { ipcRenderer } = require('electron');

// UI PRINCIPAL
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskTitle = document.getElementById('new-task-title');
const subjectSelect = document.getElementById('subject-select');
const otherSubjectInput = document.getElementById('other-subject');
const closeBtn = document.getElementById('close-btn');

// UI AJUSTES
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const inputKey = document.getElementById('setting-key');
const inputDbTasks = document.getElementById('setting-db-tasks');
const inputDbSubjects = document.getElementById('setting-db-subjects');

// BOTON CERRAR
closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-app');
});

// AJUSTES

// abrir/cerrar engranaje
settingsBtn.addEventListener('click', () => {
    toggleSettings();
});

function toggleSettings() {
    const isHidden = settingsPanel.style.display === 'none' || settingsPanel.style.display === '';
    settingsPanel.style.display = isHidden ? 'block' : 'none';
}

// guardar ajustes
saveSettingsBtn.addEventListener('click', async () => {
    const settings = {
        key: inputKey.value.trim(),
        dbId: inputDbTasks.value.trim(),
        subjectsId: inputDbSubjects.value.trim()
    };

    if (!settings.key || !settings.dbId) {
        alert("¡Faltan datos obligatorios (Key o ID Tareas)!");
        return;
    }

    await ipcRenderer.invoke('save-settings', settings);
    alert("¡Guardado! Vamos a conectar... 🚀");
    settingsPanel.style.display = 'none';
    
    // recargar datos con las nuevas claves
    loadSubjects();
    loadTasks();
});

// inicializar: comprobar si hay claves
async function initApp() {
    console.log("Iniciando app...");
    try {
        const settings = await ipcRenderer.invoke('get-settings');
        
        if (settings && settings.key) {
            console.log("✅ Claves encontradas. Cargando datos...");
            // rellenar inputs por si quiere editar
            inputKey.value = settings.key || '';
            inputDbTasks.value = settings.dbId || '';
            inputDbSubjects.value = settings.subjectsId || '';
            
            // cargar la app normal
            loadSubjects();
            loadTasks();
        } else {
            console.log("No hay claves. Abriendo ajustes...");
            settingsPanel.style.display = 'block';
        }
    } catch (error) {
        console.error("Error al iniciar:", error);
    }
}

// LOGICA TAREAS

async function loadSubjects() {
    try {
        const subjects = await ipcRenderer.invoke('get-subjects');
        subjectSelect.innerHTML = '<option value="" selected>Elige asignatura...</option>';
        subjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id; 
            option.textContent = sub.name;
            subjectSelect.appendChild(option);
        });
        const otherOption = document.createElement('option');
        otherOption.value = "other";
        otherOption.textContent = "✏️ Otro (Escribir manual)";
        subjectSelect.appendChild(otherOption);
    } catch (e) { console.error("Error cargando asignaturas (falta config)", e); }
}

subjectSelect.addEventListener('change', () => {
    if (subjectSelect.value === 'other') {
        subjectSelect.style.display = 'none';
        otherSubjectInput.style.display = 'block';
        otherSubjectInput.focus();
    }
});

otherSubjectInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || (e.key === 'Backspace' && otherSubjectInput.value === '')) {
        otherSubjectInput.style.display = 'none';
        subjectSelect.style.display = 'block';
        subjectSelect.value = ""; 
    }
});

async function handleAddTask() {
    const title = newTaskTitle.value.trim();
    let subjectToSend = subjectSelect.value === 'other' ? otherSubjectInput.value.trim() : subjectSelect.value;
    
    if (!title) return;
    
    const originalText = addTaskBtn.textContent;
    addTaskBtn.textContent = "⏳";
    
    await ipcRenderer.invoke('add-task', title, subjectToSend);
    
    newTaskTitle.value = '';
    otherSubjectInput.value = '';
    otherSubjectInput.style.display = 'none';
    subjectSelect.style.display = 'block';
    subjectSelect.value = "";
    addTaskBtn.textContent = originalText;
    
    setTimeout(() => loadTasks(), 1000);
    newTaskTitle.focus();
}

addTaskBtn.addEventListener('click', handleAddTask);
newTaskTitle.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddTask(); });
otherSubjectInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddTask(); });

async function loadTasks() {
    try {
        const tasks = await ipcRenderer.invoke('get-tasks');
        renderTasks(tasks);
    } catch (error) {
        if (error.message && error.message.includes("FALTAN_CLAVES")) {
                taskList.innerHTML = '<p class="loading">⚙️ Configura tus claves arriba</p>';
        } else {
                taskList.innerHTML = '<p class="loading">Error de conexión</p>';
        }
    }
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (!tasks || tasks.length === 0) {
        taskList.innerHTML = '<p class="loading">No hay tareas pendientes ✨</p>';
        return;
    }
    
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
        
        taskElement.querySelector('input').addEventListener('change', async () => {
            await ipcRenderer.invoke('toggle-task', task.id);
            loadTasks();
        });
        taskElement.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if(confirm('¿Borrar?')) {
                await ipcRenderer.invoke('delete-task', task.id);
                loadTasks();
            }
        });
        taskList.appendChild(taskElement);
    });
}

// LATIDO
setInterval(() => {
    const isTyping = document.activeElement === newTaskTitle || document.activeElement === otherSubjectInput;
    if (!isTyping && settingsPanel.style.display === 'none') {
        loadTasks();
    }
}, 30000);

// ARRANCAR LA APP
initApp();