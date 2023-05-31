import { useEffect, useState } from "react";
import { FERN_DOCS_CONSOLE_UTILITY } from "./FernDocsConsoleUtility";

const docsDomainRegex = /^([^.\s]+)/;

export function useCurrentDomain(): string | undefined {
    const [domain, setDomain] = useState(
        import.meta.env.VITE_DOCS_DOMAIN ?? window.location.hostname.match(docsDomainRegex)?.[1]
    );

    useEffect(() => {
        const unubscribe = FERN_DOCS_CONSOLE_UTILITY.addListener(setDomain);
        return unubscribe;
    }, []);

    return domain;
}
