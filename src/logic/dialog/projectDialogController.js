import { UI_EVENTS } from "../screenEvents";
import { focusInput } from "./dialogHelpers";

function createProjectDialogController(dom, state, pub, getCurrentProject) {
  const open = ({ initialValue = "", mode }) => {
    if (!dom.projectDialog || !dom.projectTitleInput) {
      return;
    }

    dom.projectTitleInput.value = initialValue;

    if (typeof dom.projectDialog.showModal === "function") {
      dom.projectDialog.showModal();
    }

    focusInput(dom.projectTitleInput, { select: mode === "rename" });

    pub.publish(UI_EVENTS.PROJECT_DIALOG_OPENED, {
      mode,
      currentProject: getCurrentProject(),
    });
  };

  const openCreate = () => open({ initialValue: "", mode: "create" });
  const openRename = () =>
    open({ initialValue: state.currentProjectName || "", mode: "rename" });

  return { open, openCreate, openRename };
}

export { createProjectDialogController };
