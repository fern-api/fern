import { NonIdealState, Spinner } from "@blueprintjs/core";
import { visitLoadable } from "@fern-api/loadable";
import { DocsContextProvider } from "../docs-context/DocsContextProvider";
import { useDocs } from "../queries/useDocs";
import { LoadedDocsPage } from "./LoadedDocsPage";

export declare namespace MaybeLoadedDocsPage {
    export interface Props {
        domain: string;
    }
}

export const MaybeLoadedDocsPage: React.FC<MaybeLoadedDocsPage.Props> = ({ domain }) => {
    const docs = useDocs(domain);

    return visitLoadable(docs, {
        loading: () => <NonIdealState title={<Spinner />} />,
        loaded: (docsDefinition) => (
            <DocsContextProvider docsDefinition={docsDefinition}>
                <LoadedDocsPage />
            </DocsContextProvider>
        ),
        failed: (error) => <NonIdealState title="Failed to load" description={JSON.stringify(error)} />,
    });
};
