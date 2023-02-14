import { App } from "@fern-api/ui";
import ReactDOM from "react-dom/client";

const root = document.getElementById("root");
if (root == null) {
    throw new Error("Could not locate #root in the DOM");
}
ReactDOM.createRoot(root).render(<App />);
