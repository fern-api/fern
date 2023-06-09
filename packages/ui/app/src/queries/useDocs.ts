// TODO this should be server side

import { Loadable } from "@fern-api/loadable";
import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { useEffect, useState } from "react";
import { REGISTRY_SERVICE } from "../services/registry";

export function useDocs(url: string): Loadable<FernRegistryDocsReadV2.LoadDocsForUrlResponse> {
    const [docs, setDocs] = useState<Loadable<FernRegistryDocsReadV2.LoadDocsForUrlResponse>>({
        type: "notStartedLoading",
    });

    useEffect(() => {
        setDocs({ type: "loading" });
        void REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url }).then((response) => {
            if (response.ok) {
                setDocs({ type: "loaded", value: response.body });
            } else {
                setDocs({ type: "failed", error: response.error });
            }
        });
    }, [url]);

    return docs;
}
