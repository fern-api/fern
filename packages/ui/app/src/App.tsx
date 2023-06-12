import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import classNames from "classnames";
import "normalize.css";
import { useEffect } from "react";
import { initializePosthog } from "./analytics/posthog";
import styles from "./App.module.scss";
import { CONTEXTS } from "./contexts";
import { Docs } from "./docs/Docs";
import { useAreFernFontsReady } from "./useAreFernFontsReady";

FocusStyleManager.onlyShowFocusOnTabs();

export declare namespace App {
    export interface Props {
        url: string;
        pathname: string;
    }
}

export const App: React.FC<App.Props> = ({ url, pathname }) => {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_POSTHOG_API_KEY != null && process.env.NEXT_PUBLIC_POSTHOG_API_KEY.length > 0) {
            initializePosthog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY);
        }
    }, []);

    const areFontsReady = useAreFernFontsReady();
    if (!areFontsReady) {
        return null;
    }

    return (
        <div className={classNames(styles.app, "bg-background")}>
            {CONTEXTS.reduceRight(
                (children, Context) => (
                    <Context>{children}</Context>
                ),
                <Docs url={url} pathname={pathname} />
            )}
        </div>
    );
};
