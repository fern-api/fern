import { NonIdealState, Spinner } from "@blueprintjs/core";
import { visitLoadable } from "@fern-api/loadable";
import { DocsContextProvider } from "../docs-context/DocsContextProvider";
import { useDocs } from "../queries/useDocs";
import { LoadedDocs } from "./LoadedDocs";

export declare namespace MaybeLoadedDocs {
    export interface Props {
        url: string;
        pathname: string;
    }
}

export const MaybeLoadedDocs: React.FC<MaybeLoadedDocs.Props> = ({ url, pathname }) => {
    const docs = useDocs(url);

    return visitLoadable(docs, {
        loading: () => <NonIdealState title={<Spinner />} />,
        loaded: ({ definition, baseUrl }) => (
            <DocsContextProvider docsDefinition={definition} basePath={baseUrl.basePath} pathname={pathname}>
                <LoadedDocs />
            </DocsContextProvider>
        ),
        failed: (error) => <NonIdealState title="Failed to load" description={JSON.stringify(error)} />,
    });
};
