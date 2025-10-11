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

  function updateInStorage(project) {
    storageHandler.populate({
      [project.getProps().id]: project.getProps(),
    });
  }

  for (let [key, value] of Object.entries(storageHandler.getItems())) {
    addProject(
      createProject({
        id: key,
        ...value,
      })
    );
  }

  return {
    getProject,
    getProjects,
    addProject,
    editProject,
    removeProject,
  };
})(localStorageHandler);
