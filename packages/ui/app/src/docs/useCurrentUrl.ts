import { useEffect, useState } from "react";

type WindowWithFernDocs = typeof window & {
    FernDocs?: {
        setDomain: (domain: string) => void;
    };
};

export function useCurrentUrl(): string | undefined {
    const [url, setUrl] = useState(process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? window.location.href);

    useEffect(() => {
        (window as WindowWithFernDocs).FernDocs = {
            setDomain: setUrl,
        };

        return () => {
            delete (window as WindowWithFernDocs).FernDocs;
        };
    }, []);

    return url;
}
