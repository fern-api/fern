import { FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { App } from "@fern-ui/app";
import { ThemeProvider } from "@fern-ui/theme";
import "normalize.css";
import React from "react";
import ReactDOM from "react-dom/client";
import styles from "./main.module.scss";

FocusStyleManager.onlyShowFocusOnTabs();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <div className={styles.app}>
            <ThemeProvider defaultIsDarkTheme>
                <HotkeysProvider>
                    <App />
                </HotkeysProvider>
            </ThemeProvider>
        </div>
    </React.StrictMode>
);
