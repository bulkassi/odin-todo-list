import { createPubSub } from "./pubSub";

const initializeScreenController = function (doc) {
  const pub = createPubSub();

  const projectDialog = doc.querySelector("#project-dialog");
  const projectTitleInput = doc.querySelector("#project-title-input");
  const projectAddButton = doc.querySelector(".project-add");
  const projectNameChangeButton = doc.querySelector(".project-name-change");
  const projectPickedName = doc.querySelector(".project-picked-name");
  const projectsList = doc.querySelector(".projects-list");
  const todosList = doc.querySelector(".todos-list");

  const deleteConfirmationDialog = doc.querySelector(
    "#delete-confirmation-dialog"
  );
  const deleteConfirmationYesBtn = doc.querySelector("#confirmation-yes-btn");
  const deleteConfirmationNoBtn = doc.querySelector("#confirmation-no-btn");

  const state = {
    currentProjectId: projectPickedName?.dataset.projectId || null,
    currentProjectName: projectPickedName?.textContent.trim() || "",
    pendingDeletion: {
      entityType: null,
      entityId: null,
      entityLabel: "",
    },
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

  function openDeleteConfirmationDialog({
    entityType,
    entityId = null,
    entityLabel = "",
  }) {
    if (!deleteConfirmationDialog) {
      return;
    }

    state.pendingDeletion = {
      entityType,
      entityId,
      entityLabel,
    };

    if (typeof deleteConfirmationDialog.showModal === "function") {
      deleteConfirmationDialog.showModal();
    }

    if (deleteConfirmationYesBtn) {
      deleteConfirmationYesBtn.focus();
    }

    pub.publish("ui:delete-dialog-opened", {
      ...state.pendingDeletion,
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

  projectsList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest?.(".project-delete");
    if (!deleteButton) {
      return;
    }

    const listItem = deleteButton.closest(".project-item");
    const entityId = listItem?.dataset.projectId || null;
    const entityLabel =
      listItem?.querySelector(".project-name")?.textContent.trim() || "";

    openDeleteConfirmationDialog({
      entityType: "project",
      entityId,
      entityLabel,
    });
  });

  todosList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest?.(".todo-delete");
    if (!deleteButton) {
      return;
    }

    const listItem = deleteButton.closest(".todo-item");
    const entityId = listItem?.dataset.todoId || null;
    const entityLabel =
      listItem?.querySelector(".todo-title")?.textContent.trim() || "";

    openDeleteConfirmationDialog({
      entityType: "todo",
      entityId,
      entityLabel,
    });
  });

  return {
    subscribe: pub.subscribe,
    publish: pub.publish,
    unsubscribe: pub.unsubscribe,
    unsubscribeAll: pub.unsubscribeAll,
    getCurrentProject,
    setCurrentProject,
    openDeleteConfirmationDialog,
  };
};

export { initializeScreenController };
