import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "normalize.css";
import styles from "./App.module.scss";
import { AppRoutes } from "./AppRoutes";
import { CONTEXTS } from "./contexts";

FocusStyleManager.onlyShowFocusOnTabs();

export const App: React.FC = () => {
    return (
        <div className={styles.app}>
            {CONTEXTS.reduceRight(
                (children, Context) => (
                    <Context>{children}</Context>
                ),
                <AppRoutes />
            )}
        </div>
    );
};
