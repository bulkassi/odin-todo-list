import { UI_EVENTS } from "../screenEvents";

function createDeleteDialogController(dom, state, pub) {
  const open = ({ entityType, entityId = null, entityLabel = "" }) => {
    if (!dom.deleteConfirmationDialog) {
      return;
    }

    state.pendingDeletion = {
      entityType,
      entityId,
      entityLabel,
    };

    if (typeof dom.deleteConfirmationDialog.showModal === "function") {
      dom.deleteConfirmationDialog.showModal();
    }

    dom.deleteConfirmationYesBtn?.focus();

    pub.publish(UI_EVENTS.DELETE_DIALOG_OPENED, { ...state.pendingDeletion });
  };

  return { open };
}

export { createDeleteDialogController };
