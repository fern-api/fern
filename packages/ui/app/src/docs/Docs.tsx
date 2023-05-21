import { MaybeLoadedDocs } from "./MaybeLoadedDocs";

export const Docs: React.FC = () => {
    const domain = import.meta.env.VITE_DOCS_DOMAIN ?? window.location.hostname;

    return <MaybeLoadedDocs domain={domain} />;
};
