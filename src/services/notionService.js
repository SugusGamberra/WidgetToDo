const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// logica para el env
let envPath;

if (app.isPackaged) {
    envPath = path.join(app.getPath('userData'), '.env');
} else {
    envPath = path.join(__dirname, '../../.env');
}
require('dotenv').config({ path: envPath });

console.log(`📂 Buscando archivo .env en: ${envPath}`);
const fileExists = fs.existsSync(envPath);
console.log(`🧐 ¿Existe el archivo?: ${fileExists ? "SÍ" : "NO"}`);

const TOKEN = process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN.trim() : "";
const TASKS_DB_ID = process.env.NOTION_DATABASE_ID ? process.env.NOTION_DATABASE_ID.trim() : "";
const SUBJECTS_DB_ID = process.env.NOTION_SUBJECTS_ID ? process.env.NOTION_SUBJECTS_ID.trim() : "";

const HEADERS = {
    'Authorization': `Bearer ${TOKEN}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
};

async function notionRequest(endpoint, method = 'GET', body = null) {
    const options = { method, headers: HEADERS };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`https://api.notion.com/v1${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error Notion');
    return data;
}

// lista asignaturas
async function getSubjectsList() {
    try {
        if (!TOKEN) throw new Error("No hay TOKEN. Copia el .env a la carpeta AppData.");
        const data = await notionRequest(`/databases/${SUBJECTS_DB_ID}/query`, 'POST', {
            sorts: [{ property: 'Name', direction: 'ascending' }]
        });
        return data.results.map(page => ({
            id: page.id,
            name: page.properties['Name']?.title[0]?.plain_text || 'Sin nombre'
        }));
    } catch (error) {
        console.error("Error asignaturas:", error.message);
        return [];
    }
}

// leer tareas
async function getTasks() {
    try {
        if (!TOKEN) throw new Error("No hay TOKEN. Copia el .env a la carpeta AppData.");
        
        let subjectMap = {};
        try {
            const subjects = await getSubjectsList();
            subjects.forEach(s => subjectMap[s.id] = s.name);
        } catch (e) { console.warn("No se pudieron cargar asignaturas"); }

        const data = await notionRequest(`/databases/${TASKS_DB_ID}/query`, 'POST', {
            sorts: [{ property: 'Done?', direction: 'ascending' }]
        });

        return data.results.map(page => {
            const titleProp = page.properties['Titulo'];
            let subjectName = '';
            const relation = page.properties['Assignments']?.relation;
            
            if (relation && relation.length > 0) {
                const relationId = relation[0].id;
                subjectName = subjectMap[relationId] || '...';
            }

            return {
                id: page.id,
                title: titleProp?.title[0]?.plain_text || 'Sin título',
                subject: subjectName, 
                completed: page.properties['Done?']?.checkbox || false
            };
        });
    } catch (error) {
        console.error('Error getTasks:', error.message);
        return [];
    }
}

// añadir
async function addTask(title, subjectIdOrText) {
    try {
        const properties = {
            "Titulo": { title: [{ text: { content: title } }] },
            "Done?": { checkbox: false }
        };

        if (subjectIdOrText && subjectIdOrText.includes('-') && subjectIdOrText.length > 20) {
            properties["Assignments"] = { relation: [{ id: subjectIdOrText }] };
        } else if (subjectIdOrText) {
                properties["Titulo"] = { 
                    title: [{ text: { content: `${title} (${subjectIdOrText})` } }] 
                };
        }

        const response = await notionRequest('/pages', 'POST', {
            parent: { database_id: TASKS_DB_ID },
            properties: properties
        });
        return { id: response.id }; 
    } catch (error) {
        console.error('Error addTask:', error.message);
        return null;
    }
}

async function toggleTask(taskId) {
    try {
        const page = await notionRequest(`/pages/${taskId}`, 'GET');
        const current = page.properties['Done?'].checkbox;
        await notionRequest(`/pages/${taskId}`, 'PATCH', {
            properties: { "Done?": { checkbox: !current } }
        });
        return true;
    } catch (error) { return null; }
}

async function deleteTask(taskId) {
    try {
        await notionRequest(`/pages/${taskId}`, 'PATCH', { archived: true });
        return true;
    } catch (error) { return false; }
}

module.exports = { getTasks, addTask, toggleTask, deleteTask, getSubjectsList };