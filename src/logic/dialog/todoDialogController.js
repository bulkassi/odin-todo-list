import { UI_EVENTS } from "../screenEvents";
import { focusInput } from "./dialogHelpers";

function populateTodoForm(dom, fields) {
  if (dom.todoTitleInput) {
    dom.todoTitleInput.value = fields.title || "";
  }

  if (dom.todoDescInput) {
    dom.todoDescInput.value = fields.description || "";
  }

  if (dom.todoDateInput) {
    dom.todoDateInput.value = fields.dueDate || "";
  }

  if (dom.todoPrioritySelect) {
    dom.todoPrioritySelect.value = fields.priority || "low";
  }
}

function createTodoDialogController(dom, state, pub, getCurrentProject) {
  const open = ({ mode, todoId = null, fields = {} }) => {
    if (!dom.todoDialog) {
      return;
    }

    state.pendingTodo = {
      mode,
      todoId,
      fields: {
        title: fields.title || "",
        description: fields.description || "",
        dueDate: fields.dueDate || "",
        priority: fields.priority || "low",
      },
    };

    populateTodoForm(dom, state.pendingTodo.fields);

    if (typeof dom.todoDialog.showModal === "function") {
      dom.todoDialog.showModal();
    }

    focusInput(dom.todoTitleInput, { select: mode === "edit" });

    pub.publish(UI_EVENTS.TODO_DIALOG_OPENED, {
      ...state.pendingTodo,
      currentProject: getCurrentProject(),
    });
  };

  return { open };
}

export { createTodoDialogController };
