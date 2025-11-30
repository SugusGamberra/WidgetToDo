# Widget To-Do List

**Version**: 1.0.2 **Fecha**: 30/11/2025 **Autora**: SugusGamberra
---
<p align="center">
Un widget de escritorio sencillo para gestionar tareas de mi curso ;3
Este widget está conectado a Notion!
</p>
<p align="center">
  <img src="https://img.shields.io/github/license/SugusGamberra/WidgetToDo" />
  <img src="https://img.shields.io/github/stars/SugusGamberra/WidgetToDo?style=social" />
  <img src="https://img.shields.io/github/forks/SugusGamberra/WidgetToDo?style=social" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/issues/SugusGamberra/WidgetToDo" />
  <img src="https://img.shields.io/github/issues-pr/SugusGamberra/WidgetToDo" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/SugusGamberra/WidgetToDo?style=flat&logo=git&logoColor=white&color=0080ff" />
</p>

<p align="center"><i>Built with the tools and technologies:</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" />
  <img src="https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white" />
  <img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" />
  <img src="https://img.shields.io/badge/Pug-A86454.svg?style=flat&logo=Pug&logoColor=white" />
  <img src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=fff&style=flat-square" />
  <img src="https://img.shields.io/badge/CSS-639?logo=css&logoColor=fff&style=flat-square" />
  <img src="https://img.shields.io/badge/Electron-47848F?logo=electron&logoColor=fff&style=flat-square" />
</p>

---

## 🚀 Características

- ✅ Añadir, completar y eliminar tareas
- 📚 Categorizar por asignaturas
- 💾 Almacenamiento CONECTADO A NOTION!!! // local (JSON) opcional
- 🎨 Interfaz moderna y minimalista

## ✨ Contribuciones

Las contribuciones son bienvenidas! Sigue estos pasos:

1. 🍴 Forkea el repo
2. 🌟 Crea tu branch del feature (git checkout -b feature/AmazingFeature)
3. ✅ Commitea tus cambios (git commit -m 'Add some AmazingFeature')
4. 📤 Pushea a la branch (git push origin feature/AmazingFeature)
5. 🔃 Abre una Pull Request

## 🗒️ Licencia

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.

### 📋 License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 📎 Support

- 📧 **Email**: sugusgamberra@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/SugusGamberra/WidgetToDo/issues)

## 🩵 Acknowledgments

- 🎨 **Inspiración del diseño**: Me he inspirado en el estilo glass morphism, me ha pegado duro con eso xd

---

## 🐙 SETUP

Si quieres usar este widget conectado a tu Notion tienes que seguir una serie de pasos, son un _aburrimiento_ pero muy necesarios para hacer que funcione!

1. Conseguir el **TOKEN** 🗝️
   1. Asumiendo que tienes cuenta en notion, entra aquí: [Integraciones de Notion](https://www.notion.so/profile/integrations)
   2. Dale a `+ New Integration`
   3. Ponle un nombre descriptivo
   4. Dale a **submit**
   5. Dale para ver tu token y copia esa clave secreta!
   6. Copiala y pegala en el .env que te tienes que crear en tu proyecto, a la altura del package.json y tal, y de nombre tiene que llamarse `NOTION_TOKEN`=tutokenaqui
2. Preparar tu **tablita en Notion** 📅
   1. Crea una nueva página completa (full page) en notion
   2. Asegurate que tenga **EXACTISIMAMENTE** estas columnas (importante el nombre y el tipo):
      1. **Titulo**: Tipo `title`/Titulo. Es la _columna principal_!
      2. **Done?**: Tipo `checkbox`/Casilla. Ten en cuenta el signo de interrogación 😘
   3. Arriba a la derecha de tu página, dale a los 3 puntitos - `Connections (Conexiones)` y busca el nombre de la integracion que creaste en el paso 1
3. Consigue el ID de la BBDD🆔
   1. Abre tu pagina como pagina completa (veras un simbolito royo ventanita, tu pasale el raton x encima hasta que lo veas)
   2. Mira la URL, date cuenta que entre la barra `/` y el `?` hay chorrocientos números, pos esos los tienes que copiar, pa que lo veas mejor:
      https://www.notion.so/user/`NUMEROTOLARGO12345`?
   3. Copia solo esos numeritos y pegalos en tu .env, se debe llamar `NOTION_DATABASE_ID`=tusnumeritosaqui

⚠️ **IMPORTANTE**! Para que funcione el `.exe`
Una vez instales la aplicación (`npm run dist`), tienes que copiar tu archivo .env configurado en la carpeta de datos de la aplicación:

1. Pulsa Windows + R y escribe `%APPDATA%`
2. Busca la carpeta `widget-todo`
3. Pega ahí tu archivo **.env**
4. **Reinicia** el widget

Y **listooo**!!! Ahora puedes arrancarlo en vsc para comprobar que funcione (npm start) ;3 Mas adelante haré el .exe, así que estas instrucciones son temporales :3 

> Espero qe te guste y te inspire a hacer tu propio todo list!
> Seguiré manteniendo actualizado esto hasta que tenga una version competi jiji