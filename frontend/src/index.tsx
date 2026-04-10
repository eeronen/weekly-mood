import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import App from "./App";
import DisplayPage from "./components/DisplayPage";
import "./app.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(
  () => (
    <Router>
      <Route path="/" component={App} />
      <Route path="/display" component={DisplayPage} />
    </Router>
  ),
  root,
);
