import { FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { App } from "@fern-ui/app";
import "normalize.css";
import React from "react";
import ReactDOM from "react-dom";
import styles from "./index.module.scss";

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.render(
    <React.StrictMode>
        <HotkeysProvider>
            <div className={styles.app}>
                <App />
            </div>
        </HotkeysProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
