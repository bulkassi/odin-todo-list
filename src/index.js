import "./styles.css";
import { initializeScreenController } from "./logic/screenController";

const screenController = initializeScreenController(document);

if (typeof window !== "undefined") {
  window.screenController = screenController;
}
