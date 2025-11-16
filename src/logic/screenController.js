import { format as formatDateFns, parseISO, isValid as isValidDate } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";
import { createLocalStorageHandler } from "./localStorageHandler";
import { createProjectsHandler } from "./projectsHandler";
import { createProject } from "./project";
import { createTodo } from "./todo";
import deleteProjectIcon from "../public/svg/delete.svg";
import editTodoIcon from "../public/svg/edit-todo.svg";
import deleteTodoIcon from "../public/svg/delete-todo.svg";

const DEFAULT_PROJECT_TITLE = "Новый проект";
const DELETE_DIALOG_DEFAULT_MESSAGE = "Вы уверены, что хотите удалить объект?";

function initializeScreenController(doc) {
  if (!doc) {
    throw new Error("Document reference is required.");
  }

  const dom = createDomRefs(doc);
  const storage = createLocalStorageHandler();
  const projectsStore = createProjectsHandler(storage);
  const state = {
    currentProjectId: deriveInitialProjectId(),
  };

  ensureProjectSelection();
  bindUiEvents();
  renderAll();

  return {
    getCurrentProjectId: () => state.currentProjectId,
    refresh: renderAll,
  };

  function deriveInitialProjectId() {
    const firstProject = projectsStore.getProjects()[0];
    return firstProject ? firstProject.getProps().id : null;
  }

  function ensureProjectSelection() {
    let project = state.currentProjectId
      ? projectsStore.getProject(state.currentProjectId)
      : null;

    if (!project) {
      const existing = projectsStore.getProjects();
      if (existing.length > 0) {
        project = existing[0];
      } else {
        const freshProject = createProject({ title: DEFAULT_PROJECT_TITLE });
        projectsStore.addProject(freshProject);
        project = freshProject;
      }

      state.currentProjectId = project?.getProps().id ?? null;
    }
  }

  function bindUiEvents() {
    dom.projectAddButton?.addEventListener("click", () => {
      openProjectDialog("create");
    });

    dom.projectNameChangeButton?.addEventListener("click", () => {
      const project = getCurrentProject();
      if (!project) {
        return;
      }
      openProjectDialog("rename", { project: project.getProps() });
    });

    dom.projectsList?.addEventListener("click", handleProjectsListClick);
    dom.projectForm?.addEventListener("submit", handleProjectFormSubmit);

    dom.todoAddButton?.addEventListener("click", () => {
      const project = getCurrentProject();
      if (!project) {
        return;
      }
      openTodoDialog("create");
    });

    dom.todosList?.addEventListener("click", handleTodosListClick);
    dom.todoForm?.addEventListener("submit", handleTodoFormSubmit);

    dom.deleteForm?.addEventListener("submit", handleDeleteFormSubmit);
  }

  function handleProjectsListClick(event) {
    const deleteButton = event.target.closest?.(".project-delete");
    if (deleteButton) {
      const listItem = deleteButton.closest(".project-item");
      const projectId = listItem?.dataset?.projectId;
      if (!projectId) {
        return;
      }

      const label =
        listItem?.querySelector?.(".project-name")?.textContent?.trim() || "";

      openDeleteDialog({
        entityType: "project",
        entityId: projectId,
        entityLabel: label,
      });

      return;
    }

    const selectButton = event.target.closest?.(".project-name");
    if (!selectButton) {
      return;
    }

    const listItem = selectButton.closest(".project-item");
    const projectId = listItem?.dataset?.projectId;
    if (!projectId || projectId === state.currentProjectId) {
      return;
    }

    state.currentProjectId = projectId;
    renderAll();
  }

  function handleProjectFormSubmit(event) {
    event.preventDefault();

    const submitterId = event.submitter?.id;
    if (submitterId === "project-cancel-btn") {
      closeDialog(dom.projectDialog);
      return;
    }

    const title = dom.projectTitleInput?.value?.trim();
    if (!title) {
      closeDialog(dom.projectDialog);
      return;
    }

    const mode = dom.projectDialog?.dataset?.mode || "create";
    const projectId =
      dom.projectDialog?.dataset?.projectId || state.currentProjectId;

    if (mode === "rename" && projectId) {
      projectsStore.editProject({ id: projectId, title });
      state.currentProjectId = projectId;
    } else {
      const newProject = createProject({ title });
      projectsStore.addProject(newProject);
      state.currentProjectId = newProject.getProps().id;
    }

    closeDialog(dom.projectDialog);
    renderAll();
  }

  function handleTodosListClick(event) {
    const deleteButton = event.target.closest?.(".todo-delete");
    if (deleteButton) {
      const listItem = deleteButton.closest(".todo-item");
      const todoId = listItem?.dataset?.todoId;
      if (!todoId) {
        return;
      }

      const label =
        listItem?.querySelector?.(".todo-title")?.textContent?.trim() || "";

      openDeleteDialog({
        entityType: "todo",
        entityId: todoId,
        entityLabel: label,
      });

      return;
    }

    const editButton = event.target.closest?.(".todo-edit");
    if (!editButton) {
      return;
    }

    const project = getCurrentProject();
    if (!project) {
      return;
    }

    const listItem = editButton.closest(".todo-item");
    const todoId = listItem?.dataset?.todoId;
    if (!todoId) {
      return;
    }

    const todo = project
      .getProps()
      .todos.find((item) => item.getProps().id === todoId);

    if (!todo) {
      return;
    }

    openTodoDialog("edit", { todo: todo.getProps() });
  }

  function handleTodoFormSubmit(event) {
    event.preventDefault();

    const submitterId = event.submitter?.id;
    if (submitterId === "todo-cancel-btn") {
      closeDialog(dom.todoDialog);
      return;
    }

    const project = getCurrentProject();
    if (!project) {
      closeDialog(dom.todoDialog);
      return;
    }

    const mode = dom.todoDialog?.dataset?.mode || "create";
    const todoId = dom.todoDialog?.dataset?.todoId || null;
    const formData = readTodoForm();

    if (!formData.title) {
      closeDialog(dom.todoDialog);
      return;
    }

    if (mode === "edit" && todoId) {
      projectsStore.editTodoInProject(project.getProps().id, {
        id: todoId,
        ...formData,
      });
    } else {
      const newTodo = createTodo(formData);
      projectsStore.addTodoToProject(project.getProps().id, newTodo);
    }

    closeDialog(dom.todoDialog);
    renderAll();
  }

  function handleDeleteFormSubmit(event) {
    event.preventDefault();

    const submitterId = event.submitter?.id;
    if (submitterId === "confirmation-no-btn") {
      closeDialog(dom.deleteDialog);
      return;
    }

    const { entityType, entityId } = dom.deleteDialog?.dataset || {};
    if (!entityType || !entityId) {
      closeDialog(dom.deleteDialog);
      return;
    }

    if (entityType === "project") {
      projectsStore.removeProject(entityId);

      if (state.currentProjectId === entityId) {
        state.currentProjectId = null;
        ensureProjectSelection();
      }
    } else if (entityType === "todo") {
      const project = getCurrentProject();
      if (project) {
        projectsStore.removeTodoFromProject(project.getProps().id, entityId);
      }
    }

    closeDialog(dom.deleteDialog);
    renderAll();
  }

  function openProjectDialog(mode, { project } = {}) {
    if (!dom.projectDialog) {
      return;
    }

    dom.projectDialog.dataset.mode = mode;
    dom.projectDialog.dataset.projectId = project?.id || "";
    if (dom.projectTitleInput) {
      dom.projectTitleInput.value = project?.title || "";
    }

    dom.projectDialog.showModal?.();
    focusField(dom.projectTitleInput, { select: mode !== "create" });
  }

  function openTodoDialog(mode, { todo } = {}) {
    if (!dom.todoDialog) {
      return;
    }

    dom.todoDialog.dataset.mode = mode;
    dom.todoDialog.dataset.todoId = todo?.id || "";

    populateTodoForm(
      todo || { title: "", description: "", dueDate: "", priority: "low" }
    );

    dom.todoDialog.showModal?.();
    focusField(dom.todoTitleInput, { select: mode === "edit" });
  }

  function openDeleteDialog({ entityType, entityId, entityLabel }) {
    if (!dom.deleteDialog) {
      return;
    }

    dom.deleteDialog.dataset.entityType = entityType;
    dom.deleteDialog.dataset.entityId = entityId || "";
    dom.deleteDialog.dataset.entityLabel = entityLabel || "";

    if (dom.deleteDialogMessage) {
      dom.deleteDialogMessage.textContent = entityLabel
        ? `Удалить «${entityLabel}»?`
        : DELETE_DIALOG_DEFAULT_MESSAGE;
    }

    dom.deleteDialog.showModal?.();
    dom.deleteConfirmationYesBtn?.focus();
  }

  function readTodoForm() {
    return {
      title: dom.todoTitleInput?.value?.trim() || "",
      description: dom.todoDescInput?.value?.trim() || "",
      dueDate: dom.todoDateInput?.value || "",
      priority: dom.todoPrioritySelect?.value || "low",
    };
  }

  function populateTodoForm(fields) {
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

  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }

    dialog.close?.();
  }

  function getCurrentProject() {
    return state.currentProjectId
      ? projectsStore.getProject(state.currentProjectId)
      : null;
  }

  function renderAll() {
    renderProjectsList();
    renderCurrentProjectSection();
  }

  function renderProjectsList() {
    if (!dom.projectsList) {
      return;
    }

    const projects = projectsStore.getProjects();

    if (projects.length === 0) {
      dom.projectsList.innerHTML = "";
      return;
    }

    const itemsMarkup = projects
      .map((project) => {
        const props = project.getProps();
        const isActive = props.id === state.currentProjectId;

        return `
          <li class="project-item${
            isActive ? " is-active" : ""
          }" data-project-id="${props.id}">
            <button class="project-name"${
              isActive ? ' aria-current="true"' : ""
            }>${escapeHtml(props.title || "Без названия")}</button>
            <button class="project-delete" aria-label="Удалить проект">
              <img src="${deleteProjectIcon}" alt="Delete project" />
            </button>
          </li>
        `;
      })
      .join("");

    dom.projectsList.innerHTML = itemsMarkup;
  }

  function renderCurrentProjectSection() {
    const project = getCurrentProject();

    if (!project) {
      if (dom.projectPickedName) {
        dom.projectPickedName.textContent = "";
        delete dom.projectPickedName.dataset.projectId;
      }
      toggleProjectActions(true);
      clearTodosList();
      return;
    }

    const props = project.getProps();

    if (dom.projectPickedName) {
      dom.projectPickedName.textContent = props.title || "Без названия";
      dom.projectPickedName.dataset.projectId = props.id;
    }

    toggleProjectActions(false);
    renderTodosList(props.todos);
  }

  function toggleProjectActions(disabled) {
    if (dom.projectNameChangeButton) {
      dom.projectNameChangeButton.disabled = disabled;
    }
    if (dom.todoAddButton) {
      dom.todoAddButton.disabled = disabled;
    }
  }

  function clearTodosList() {
    if (dom.todosList) {
      dom.todosList.innerHTML = "";
    }
  }

  function renderTodosList(todos) {
    if (!dom.todosList) {
      return;
    }

    if (!Array.isArray(todos) || todos.length === 0) {
      dom.todosList.innerHTML = "";
      return;
    }

    const itemsMarkup = todos
      .map((todo) => {
        const fields = todo.getProps();
        const priority = normalizePriority(fields.priority);
        const priorityLabel = getPriorityLabel(priority);
        const displayDate = formatDate(fields.dueDate);

        return `
          <li class="todo-item" data-todo-id="${
            fields.id
          }" data-todo-priority="${priority}" data-todo-due-date="${
          fields.dueDate || ""
        }">
            <h3 class="todo-title">${escapeHtml(
              fields.title || "Без названия"
            )}</h3>
            ${
              fields.description
                ? `<p class="todo-desc">${escapeHtml(fields.description)}</p>`
                : ""
            }
            ${
              displayDate
                ? `<p class="todo-date">${escapeHtml(displayDate)}</p>`
                : ""
            }
            <div class="todo-priority ${priority}" data-priority="${priority}">${priorityLabel}</div>
            <button class="todo-edit" aria-label="Изменить задачу">
              <img src="${editTodoIcon}" alt="Edit todo" />
            </button>
            <button class="todo-delete" aria-label="Удалить задачу">
              <img src="${deleteTodoIcon}" alt="Delete todo" />
            </button>
          </li>
        `;
      })
      .join("");

    dom.todosList.innerHTML = itemsMarkup;
  }

  function normalizePriority(priority) {
    if (priority === "high" || priority === "medium") {
      return priority;
    }
    return "low";
  }

  function getPriorityLabel(priority) {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      default:
        return "Низкий";
    }
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    let date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      date = parseISO(value);
      if (!isValidDate(date)) {
        date = new Date(value);
      }
    } else {
      date = new Date(value);
    }

    if (!isValidDate(date)) {
      return value;
    }

    try {
      return formatDateFns(date, "d MMMM yyyy", { locale: ruLocale });
    } catch (error) {
      return value;
    }
  }
}

function createDomRefs(doc) {
  const selectors = {
    projectDialog: "#project-dialog",
    projectForm: "#project-dialog form",
    projectTitleInput: "#project-title-input",
    projectAddButton: ".project-add",
    projectNameChangeButton: ".project-name-change",
    projectPickedName: ".project-picked-name",
    projectsList: ".projects-list",
    todoDialog: "#todo-dialog",
    todoForm: "#todo-dialog form",
    todoTitleInput: "#todo-title-input",
    todoDescInput: "#todo-desc-input",
    todoDateInput: "#todo-date-input",
    todoPrioritySelect: "#todo-priority-select",
    todoAddButton: ".todo-add",
    todosList: ".todos-list",
    deleteDialog: "#delete-confirmation-dialog",
    deleteForm: "#delete-confirmation-dialog form",
    deleteDialogMessage: ".delete-confirmation-dialog-header",
    deleteConfirmationYesBtn: "#confirmation-yes-btn",
    deleteConfirmationNoBtn: "#confirmation-no-btn",
  };

  const dom = {};

  Object.entries(selectors).forEach(([key, selector]) => {
    dom[key] = doc.querySelector(selector);
  });

  return dom;
}

function focusField(field, { select = false } = {}) {
  if (!field) {
    return;
  }

  field.focus();

  if (select && typeof field.select === "function") {
    field.select();
  } else if (!select && typeof field.setSelectionRange === "function") {
    field.setSelectionRange(field.value.length, field.value.length);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export { initializeScreenController };
