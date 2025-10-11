import { createProject } from "./project";

export const projectsHandler = (function () {
  let projects = new Map();

  function getProject(id) {
    return projects.get(id);
  }

  function getProjects() {
    return Array.from(projects.values());
  }

  function addProject(project) {
    projects.set(project.getProps().id, project);
  }

  function editProject(props) {
    if (props.id !== undefined && projects.has(props.id)) {
      console.log("found!!");
      projects.get(props.id).setProps(props);
    }
  }

  function removeProject(id) {
    projects.delete(id);
  }

  return {
    getProject,
    getProjects,
    addProject,
    editProject,
    removeProject,
  };
})();
