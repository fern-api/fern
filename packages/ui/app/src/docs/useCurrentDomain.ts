import { useEffect, useState } from "react";
import { FERN_DOCS_CONSOLE_UTILITY } from "./FernDocsConsoleUtility";

export function useCurrentUrl(): string | undefined {
    const [url, setUrl] = useState(import.meta.env.VITE_DOCS_DOMAIN ?? window.location.href);

    useEffect(() => {
        const unubscribe = FERN_DOCS_CONSOLE_UTILITY.addListener(setUrl);
        return unubscribe;
    }, []);

    return url;
}
