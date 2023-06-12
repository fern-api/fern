import { useEffect, useState } from "react";

type WindowWithFernDocs = typeof window & {
    FernDocs?: {
        setDomain: (domain: string) => void;
    };
};

export declare namespace useCurrentUrl {
    export interface Props {
        windowUrl: string;
    }
}

export function useCurrentUrl({ windowUrl }: useCurrentUrl.Props): string {
    const [url, setUrl] = useState(process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? windowUrl);

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
