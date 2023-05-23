import { NonIdealState } from "@blueprintjs/core";
import { MaybeLoadedDocs } from "./MaybeLoadedDocs";

const docsDomainRegex = /^(.*)\.buildwithfern.com$/;
const domain = import.meta.env.VITE_DOCS_DOMAIN ?? window.location.hostname.match(docsDomainRegex)?.[1];

export const Docs: React.FC = () => {
    if (domain == null) {
        return <NonIdealState title="Domain not found" />;
    }
    return <MaybeLoadedDocs domain={domain} />;
};
