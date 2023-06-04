import { NonIdealState } from "@blueprintjs/core";
import { MaybeLoadedDocs } from "./MaybeLoadedDocs";
import { useCurrentUrl } from "./useCurrentDomain";

export const Docs: React.FC = () => {
    const url = useCurrentUrl();
    if (url == null) {
        return <NonIdealState title="Domain not found" />;
    }
    return <MaybeLoadedDocs url={url} />;
};
