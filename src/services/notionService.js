const Store = require('electron-store');
const store = new Store();

function getCredentials() {
    const settings = store.get('userSettings');
    if (!settings) return null;
    return {
        TOKEN: settings.key,
        TASKS_DB_ID: settings.dbId,
        SUBJECTS_DB_ID: settings.subjectsId
    };
}

const HEADERS = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
});

async function notionRequest(endpoint, method = 'GET', body = null) {
    const creds = getCredentials();
    if (!creds || !creds.TOKEN) throw new Error("FALTAN_CLAVES");

    const options = { method, headers: HEADERS(creds.TOKEN) };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`https://api.notion.com/v1${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) {
        console.error("ERROR NOTION:", JSON.stringify(data));
        throw new Error(data.message || 'Error Notion');
    }
    return data;
}

// leer lista asignaturas
async function getSubjectsList() {
    try {
        const creds = getCredentials();
        if (!creds || !creds.SUBJECTS_DB_ID) return [];
        
        const data = await notionRequest(`/databases/${creds.SUBJECTS_DB_ID}/query`, 'POST', {
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
        const creds = getCredentials();
        if (!creds) throw new Error("FALTAN_CLAVES");

        let subjectMap = {};
        try {
            const subjects = await getSubjectsList();
            subjects.forEach(s => subjectMap[s.id] = s.name);
        } catch (e) {}

        const data = await notionRequest(`/databases/${creds.TASKS_DB_ID}/query`, 'POST', {
            sorts: [{ property: 'Done?', direction: 'ascending' }]
        });

        return data.results.map(page => {
            const titleProp = page.properties['Titulo']; 
            
            let subjectName = '';
            const relation = page.properties['Assignments']?.relation;
            if (relation && relation.length > 0) {
                subjectName = subjectMap[relation[0].id] || '...';
            }

            return {
                id: page.id,
                title: titleProp?.title[0]?.plain_text || 'Sin título',
                subject: subjectName, 
                completed: page.properties['Done?']?.checkbox || false
            };
        });
    } catch (error) {
        if (error.message === "FALTAN_CLAVES") throw error;
        console.error('Error getTasks:', error.message);
        return [];
    }
}

// añadir tarea
async function addTask(title, subjectIdOrText) {
    try {
        const creds = getCredentials();
        
        const properties = {
            "Titulo": { title: [{ text: { content: title } }] },
            "Done?": { checkbox: false }
        };

        if (subjectIdOrText) {
            const esID = subjectIdOrText.includes('-') && subjectIdOrText.length > 30;

            if (esID) {
                properties["Assignments"] = { 
                    relation: [{ id: subjectIdOrText }] 
                };
            } else {
                properties["Titulo"] = { 
                    title: [{ text: { content: `${title} (${subjectIdOrText})` } }] 
                };
            }
        }

        const response = await notionRequest('/pages', 'POST', {
            parent: { database_id: creds.TASKS_DB_ID },
            properties: properties
        });
        return { id: response.id }; 
    } catch (error) {
        console.error('❌ Error addTask:', error.message);
        return null;
    }
}

async function toggleTask(taskId) {
    try {
        const page = await notionRequest(`/pages/${taskId}`, 'GET');
        const current = page.properties['Done?'].checkbox;
        await notionRequest(`/pages/${taskId}`, 'PATCH', { properties: { "Done?": { checkbox: !current } } });
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