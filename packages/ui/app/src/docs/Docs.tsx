import { NonIdealState } from "@blueprintjs/core";
import { MaybeLoadedDocs } from "./MaybeLoadedDocs";
import { useCurrentDomain } from "./useCurrentDomain";

export const Docs: React.FC = () => {
    const domain = useCurrentDomain();
    if (domain == null) {
        return <NonIdealState title="Domain not found" />;
    }
    return <MaybeLoadedDocs domain={domain} />;
};
