import { createTodo } from "./todo";

function generateId() {
  return Math.random().toString(36).slice(0, 16);
}

export function createProject(props) {
  const id = props.id || generateId();
  let title = props.title || "";
  let todos = new Map();

  function getProps() {
    return {
      id,
      title,
      todos: Array.from(todos.values()).map((todo) => todo.getProps()),
    };
  }

  function setProps(props) {
    if (props.title !== undefined) {
      title = props.title;
    }
    if (props.todos !== undefined) {
      todos.clear();
      for (let todo of props.todos) {
        addTodo(todo);
      }
    }
  }

  function addTodo(todo) {
    todos.set(todo.getProps().id, todo);
  }

  function editTodo(props) {
    if (props.id !== undefined) {
      todos.get(props.id).setProps(props);
    }
  }

  function removeTodo(id) {
    return todos.delete(id);
  }

  return {
    getProps,
    setProps,
    addTodo,
    editTodo,
    removeTodo,
  };
}
