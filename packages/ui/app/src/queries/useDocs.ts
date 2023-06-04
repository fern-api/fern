import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import { REGISTRY_SERVICE } from "../services/registry";

export function useDocs(url: string): Loadable<FernRegistryDocsReadV2.LoadDocsForUrlResponse> {
    return useTypedQuery(buildQueryKey(url), async () => {
        const response = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });
        if (response.ok) {
            return response.body;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}

function buildQueryKey(domain: string): TypedQueryKey<FernRegistryDocsReadV2.LoadDocsForUrlResponse> {
    const queryKey = ["docs", { domain }];
    return TypedQueryKey.of(queryKey);
}
