import { NonIdealState, Spinner } from "@blueprintjs/core";
import { visitLoadable } from "@fern-api/loadable";
import { DocsContextProvider } from "../docs-context/DocsContextProvider";
import { useDocs } from "../queries/useDocs";
import { LoadedDocs } from "./LoadedDocs";

export declare namespace MaybeLoadedDocs {
    export interface Props {
        url: string;
    }
}

export const MaybeLoadedDocs: React.FC<MaybeLoadedDocs.Props> = ({ url }) => {
    const docs = useDocs(url);

    return visitLoadable(docs, {
        loading: () => <NonIdealState title={<Spinner />} />,
        loaded: (docsDefinition) => (
            <DocsContextProvider docsDefinition={docsDefinition}>
                <LoadedDocs />
            </DocsContextProvider>
        ),
        failed: (error) => <NonIdealState title="Failed to load" description={JSON.stringify(error)} />,
    });
};
