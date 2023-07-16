import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import "@fontsource/ibm-plex-mono";
import classNames from "classnames";
import "normalize.css";
import { useEffect } from "react";
import { initializePosthog } from "./analytics/posthog";
import styles from "./App.module.scss";
import { CONTEXTS } from "./contexts";
import { DocsContextProvider } from "./docs-context/DocsContextProvider";
import { Docs } from "./docs/Docs";
import { ResolvedUrlPath } from "./ResolvedUrlPath";

FocusStyleManager.onlyShowFocusOnTabs();
const sss = "hsl(0, 0%, 40%)";

export declare namespace App {
    export interface Props {
        docs: FernRegistryDocsRead.LoadDocsForUrlResponse;
        resolvedUrlPath: ResolvedUrlPath;
        nextPath: ResolvedUrlPath | undefined;
        previousPath: ResolvedUrlPath | undefined;
    }
}

export const App: React.FC<App.Props> = ({ docs, resolvedUrlPath, nextPath, previousPath }) => {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_POSTHOG_API_KEY != null && process.env.NEXT_PUBLIC_POSTHOG_API_KEY.length > 0) {
            initializePosthog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY);
        }
    }, []);

    return (
        <div className={classNames(styles.app, "flex flex-1 h-screen bg-background")}>
            {CONTEXTS.reduceRight(
                (children, Context) => (
                    <Context>{children}</Context>
                ),
                <DocsContextProvider
                    docsDefinition={docs.definition}
                    resolvedUrlPath={resolvedUrlPath}
                    nextPath={nextPath}
                    previousPath={previousPath}
                >
                    <Docs />
                </DocsContextProvider>
            )}
        </div>
    );
};
