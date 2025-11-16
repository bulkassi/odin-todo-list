function focusInput(input, { select = false } = {}) {
  if (!input) {
    return;
  }

  input.focus();

  if (select && typeof input.select === "function") {
    input.select();
  } else if (!select && typeof input.setSelectionRange === "function") {
    input.setSelectionRange(0, 0);
  }
}

export { focusInput };
