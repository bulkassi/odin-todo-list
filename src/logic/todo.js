function generateId() {
  return Math.random().toString(36).slice(0, 16);
}

export function createTodo(props) {
  const id = props.id || generateId();
  let title = props.title || "";
  let description = props.description || "";
  let dueDate = props.dueDate || "";
  let priority = props.priority || 0;

  function getProps() {
    return {
      id,
      title,
      description,
      dueDate,
      priority,
    };
  }

  function setProps(props) {
    if (props.title !== undefined) {
      title = props.title;
    }
    if (props.description !== undefined) {
      description = props.description;
    }
    if (props.dueDate !== undefined) {
      dueDate = props.dueDate;
    }
    if (props.priority !== undefined) {
      priority = props.priority;
    }
  }

  return {
    getProps,
    setProps,
  };
}
