const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

// BUSCAR ID DE ASIGNATURA
async function findSubjectId(name) {
    if (!name || !SUBJECTS_DB_ID) return null;
    try {
        const data = await notionRequest(`/databases/${SUBJECTS_DB_ID}/query`, 'POST', {
            filter: {
                property: "Name", 
                title: { equals: name }
            }
        });
        return data.results.length > 0 ? data.results[0].id : null;
    } catch (e) {
        return null;
    }
}

function mapTask(page) {
    const titleProp = page.properties['Titulo'];
    return {
        id: page.id,
        title: titleProp?.title[0]?.plain_text || 'Sin título',
        subject: '',
        completed: page.properties['Done?']?.checkbox || false
    };
}

async function getTasks() {
    try {
        const data = await notionRequest(`/databases/${TASKS_DB_ID}/query`, 'POST', {
            sorts: [{ property: 'Done?', direction: 'ascending' }]
        });
        return data.results.map(mapTask);
    } catch (error) {
        console.error('Error getTasks:', error.message);
        return [];
    }
}

async function addTask(title, subjectName) {
    try {
        const properties = {
            "Titulo": { title: [{ text: { content: title } }] },
            "Done?": { checkbox: false }
        };

        // se hace el intento de buscar la asignatura aunque... weno xd
        if (subjectName) {
            const subjectId = await findSubjectId(subjectName);
            if (subjectId) {
                // si existe en Notion, la relacionamos
                properties["Assignments"] = { relation: [{ id: subjectId }] };
            } else {
                // si no, la pegamos al título para no perderla
                properties["Titulo"] = { title: [{ text: { content: `${title} (${subjectName})` } }] };
            }
        }

        const response = await notionRequest('/pages', 'POST', {
            parent: { database_id: TASKS_DB_ID },
            properties: properties
        });
        return mapTask(response);
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

module.exports = { getTasks, addTask, toggleTask, deleteTask };