import { createTodo } from "./todo";
import { createProject } from "./project";
import { localStorageHandler } from "./localStorageHandler";

export const projectsHandler = (function (storageHandler) {
  let projects = new Map();

  function getProject(id) {
    return projects.get(id);
  }

  function getProjects() {
    return Array.from(projects.values());
  }

  function addProject(project) {
    projects.set(project.getProps().id, project);

    updateInStorage(project);
  }

  function editProject(props) {
    if (props.id !== undefined && projects.has(props.id)) {
      projects.get(props.id).setProps(props);

      updateInStorage(projects.get(props.id));
    }
  }

  function removeProject(id) {
    projects.delete(id);

    storageHandler.removeItem(id);
  }

  function addTodoToProject(projectId, todo) {
    if (projectId && projects.has(projectId)) {
      projects.get(projectId).addTodo(todo);

      updateInStorage(projects.get(projectId));
    }
  }

  function editTodoInProject(projectId, todoProps) {
    if (projectId && projects.has(projectId)) {
      projects.get(projectId).editTodo(todoProps);

      updateInStorage(projects.get(projectId));
    }
  }

  function removeTodoFromProject(projectId, todoId) {
    if (projectId && projects.has(projectId)) {
      projects.get(projectId).removeTodo(todoId);

      updateInStorage(projects.get(projectId));
    }
  }

  function updateInStorage(project) {
    const todosArray = Array.from(project.getProps().todos).map((todo) =>
      todo.getProps()
    );

    storageHandler.populate({
      [project.getProps().id]: {
        title: project.getProps().title,
        todos: todosArray,
      },
    });
  }

  for (let [key, value] of Object.entries(storageHandler.getItems())) {
    const project = createProject({
      id: key,
      title: value.title,
    });

    if (value.todos && Array.isArray(value.todos)) {
      value.todos.forEach((todoProps) => {
        project.addTodo(createTodo(todoProps));
      });
    }

    addProject(project);
  }

  return {
    getProject,
    getProjects,
    addProject,
    editProject,
    removeProject,
    addTodoToProject,
    editTodoInProject,
    removeTodoFromProject,
  };
})(localStorageHandler);
