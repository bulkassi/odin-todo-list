import { createPubSub } from "./pubSub";

const initializeScreenController = function (doc) {
  const pub = createPubSub();

  const projectDialog = doc.querySelector("#project-dialog");
  const projectTitleInput = doc.querySelector("#project-title-input");
  const projectAddButton = doc.querySelector(".project-add");
  const projectNameChangeButton = doc.querySelector(
    ".project-name-change"
  );
  const projectPickedName = doc.querySelector(".project-picked-name");

  const state = {
    currentProjectId: projectPickedName?.dataset.projectId || null,
    currentProjectName: projectPickedName?.textContent.trim() || "",
  };

  function getCurrentProject() {
    return { ...state };
  }

  function setCurrentProject({ id = null, name = "" } = {}) {
    state.currentProjectId = id;
    state.currentProjectName = name;

    if (projectPickedName && typeof name === "string") {
      projectPickedName.textContent = name;
      if (id) {
        projectPickedName.dataset.projectId = id;
      } else {
        delete projectPickedName.dataset.projectId;
      }
    }
  }

  function openProjectDialog({ initialValue = "", mode }) {
    if (!projectDialog || !projectTitleInput) {
      return;
    }

    projectTitleInput.value = initialValue;
    if (typeof projectDialog.showModal === "function") {
      projectDialog.showModal();
    }

    projectTitleInput.focus();

    if (typeof projectTitleInput.select === "function") {
      if (mode === "rename") {
        projectTitleInput.select();
      } else if (typeof projectTitleInput.setSelectionRange === "function") {
        projectTitleInput.setSelectionRange(0, 0);
      }
    }

    pub.publish("ui:project-dialog-opened", {
      mode,
      currentProject: getCurrentProject(),
    });
  }

  projectAddButton?.addEventListener("click", () => {
    openProjectDialog({ initialValue: "", mode: "create" });
  });

  projectNameChangeButton?.addEventListener("click", () => {
    const name =
      projectPickedName?.textContent.trim() || state.currentProjectName || "";

    state.currentProjectName = name;

    if (projectPickedName?.dataset.projectId) {
      state.currentProjectId = projectPickedName.dataset.projectId;
    }

    openProjectDialog({ initialValue: name, mode: "rename" });
  });

  return {
    subscribe: pub.subscribe,
    publish: pub.publish,
    unsubscribe: pub.unsubscribe,
    unsubscribeAll: pub.unsubscribeAll,
    getCurrentProject,
    setCurrentProject,
  };
};

export { initializeScreenController };
