import { NonIdealState } from "@blueprintjs/core";
import { useSearchParams } from "react-router-dom";
import { MaybeLoadedDocsPage } from "./MaybeLoadedDocsPage";

export const DocsPage: React.FC = () => {
    const [urlSearchParams] = useSearchParams();
    const domain = urlSearchParams.get("domain");

    if (domain == null) {
        return <NonIdealState title="'domain' query param is missing" />;
    }

    return <MaybeLoadedDocsPage domain={domain} />;
};
