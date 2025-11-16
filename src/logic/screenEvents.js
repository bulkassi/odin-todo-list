const UI_EVENTS = Object.freeze({
  PROJECT_DIALOG_OPENED: "ui:project-dialog-opened",
  TODO_DIALOG_OPENED: "ui:todo-dialog-opened",
  DELETE_DIALOG_OPENED: "ui:delete-dialog-opened",
});

const EVENTS = Object.freeze({
  PROJECT_SELECTED: "project-selected",
  PROJECT_ADDED: "project-added",
  PROJECT_CHANGED: "project-changed",
  PROJECT_DELETED: "project-deleted",
  TODO_ADDED: "todo-added",
  TODO_CHANGED: "todo-changed",
  TODO_DELETED: "todo-deleted",
});

export { UI_EVENTS, EVENTS };
