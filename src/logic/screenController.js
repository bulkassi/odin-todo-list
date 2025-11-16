import { createPubSub } from "./pubSub";
import { createProjectDialogController } from "./dialog/projectDialogController";
import { createTodoDialogController } from "./dialog/todoDialogController";
import { createDeleteDialogController } from "./dialog/deleteDialogController";
import { UI_EVENTS, EVENTS } from "./screenEvents";

const initializeScreenController = function (doc) {
  const pub = createPubSub();
  const dom = createDomRefs(doc);
  const state = createInitialState(dom);

  const getCurrentProject = () => ({
    id: state.currentProjectId,
    name: state.currentProjectName,
  });

  const setCurrentProject = ({ id = null, name = "" } = {}) => {
    state.currentProjectId = id;
    state.currentProjectName = name;

    if (dom.projectPickedName && typeof name === "string") {
      dom.projectPickedName.textContent = name;

      if (id) {
        dom.projectPickedName.dataset.projectId = id;
      } else {
        delete dom.projectPickedName.dataset.projectId;
      }
    }
  };

  const syncCurrentProjectFromDom = () => {
    const name = dom.projectPickedName?.textContent ?? "";
    state.currentProjectName = name.trim();
    state.currentProjectId = dom.projectPickedName?.dataset?.projectId || null;
    return getCurrentProject();
  };

  const projectDialog = createProjectDialogController(
    dom,
    state,
    pub,
    getCurrentProject
  );
  const todoDialog = createTodoDialogController(
    dom,
    state,
    pub,
    getCurrentProject
  );
  const deleteDialog = createDeleteDialogController(dom, state, pub);

  createProjectsUIController(
    dom,
    projectDialog,
    deleteDialog,
    syncCurrentProjectFromDom
  );
  createTodosUIController(dom, todoDialog, deleteDialog);

  return {
    events: EVENTS,
    uiEvents: UI_EVENTS,
    subscribe: pub.subscribe,
    publish: pub.publish,
    unsubscribe: pub.unsubscribe,
    unsubscribeAll: pub.unsubscribeAll,
    getCurrentProject,
    setCurrentProject,
    openProjectDialog: projectDialog.open,
    openTodoDialog: todoDialog.open,
    openDeleteConfirmationDialog: deleteDialog.open,
  };
};

function createDomRefs(doc) {
  return {
    projectDialog: doc.querySelector("#project-dialog"),
    projectTitleInput: doc.querySelector("#project-title-input"),
    projectAddButton: doc.querySelector(".project-add"),
    projectNameChangeButton: doc.querySelector(".project-name-change"),
    projectPickedName: doc.querySelector(".project-picked-name"),
    projectsList: doc.querySelector(".projects-list"),
    todosList: doc.querySelector(".todos-list"),
    todoDialog: doc.querySelector("#todo-dialog"),
    todoTitleInput: doc.querySelector("#todo-title-input"),
    todoDescInput: doc.querySelector("#todo-desc-input"),
    todoDateInput: doc.querySelector("#todo-date-input"),
    todoPrioritySelect: doc.querySelector("#todo-priority-select"),
    todoAddButton: doc.querySelector(".todo-add"),
    deleteConfirmationDialog: doc.querySelector("#delete-confirmation-dialog"),
    deleteConfirmationYesBtn: doc.querySelector("#confirmation-yes-btn"),
    deleteConfirmationNoBtn: doc.querySelector("#confirmation-no-btn"),
  };
}

function createInitialState(dom) {
  const name = dom.projectPickedName?.textContent ?? "";

  return {
    currentProjectId: dom.projectPickedName?.dataset?.projectId || null,
    currentProjectName: name.trim(),
    pendingDeletion: {
      entityType: null,
      entityId: null,
      entityLabel: "",
    },
    pendingTodo: {
      mode: null,
      todoId: null,
      fields: {
        title: "",
        description: "",
        dueDate: "",
        priority: "low",
      },
    },
  };
}

function attachListeners(configs) {
  configs
    .filter(({ element, handler }) => element && typeof handler === "function")
    .forEach(({ element, type, handler }) => {
      element.addEventListener(type, handler);
    });
}

function readTodoData(listItem) {
  if (!listItem) {
    return {
      todoId: null,
      fields: {
        title: "",
        description: "",
        dueDate: "",
        priority: "low",
      },
    };
  }

  const priorityFromDataset = listItem.dataset?.todoPriority;
  const priorityFromBadge =
    listItem.querySelector?.(".todo-priority")?.dataset?.priority;

  return {
    todoId: listItem.dataset?.todoId || null,
    fields: {
      title:
        listItem.querySelector?.(".todo-title")?.textContent?.trim?.() || "",
      description:
        listItem.querySelector?.(".todo-desc")?.textContent?.trim?.() || "",
      dueDate: listItem.dataset?.todoDueDate || "",
      priority: priorityFromDataset || priorityFromBadge || "low",
    },
  };
}

function createProjectsUIController(
  dom,
  projectDialog,
  deleteDialog,
  syncCurrentProjectFromDom
) {
  attachListeners([
    {
      element: dom.projectAddButton,
      type: "click",
      handler: projectDialog.openCreate,
    },
    {
      element: dom.projectNameChangeButton,
      type: "click",
      handler: () => {
        syncCurrentProjectFromDom();
        projectDialog.openRename();
      },
    },
  ]);

  dom.projectsList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest?.(".project-delete");
    if (!deleteButton) {
      return;
    }

    const listItem = deleteButton.closest(".project-item");
    const entityId = listItem?.dataset?.projectId || null;
    const entityLabel =
      listItem?.querySelector?.(".project-name")?.textContent?.trim?.() || "";

    deleteDialog.open({
      entityType: "project",
      entityId,
      entityLabel,
    });
  });
}

function createTodosUIController(dom, todoDialog, deleteDialog) {
  attachListeners([
    {
      element: dom.todoAddButton,
      type: "click",
      handler: () => todoDialog.open({ mode: "create" }),
    },
  ]);

  dom.todosList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest?.(".todo-delete");
    if (deleteButton) {
      const listItem = deleteButton.closest(".todo-item");
      const entityId = listItem?.dataset?.todoId || null;
      const entityLabel =
        listItem?.querySelector?.(".todo-title")?.textContent?.trim?.() || "";

      deleteDialog.open({
        entityType: "todo",
        entityId,
        entityLabel,
      });

      return;
    }

    const editButton = event.target.closest?.(".todo-edit");
    if (!editButton) {
      return;
    }

    const listItem = editButton.closest(".todo-item");
    const { todoId, fields } = readTodoData(listItem);

    todoDialog.open({
      mode: "edit",
      todoId,
      fields,
    });
  });
}

export { initializeScreenController };
