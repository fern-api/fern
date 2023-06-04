import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { REGISTRY_SERVICE } from "../services/registry";

export function useDocs(url: string): Loadable<FernRegistryDocsRead.DocsDefinition> {
    return useTypedQuery(buildQueryKey(url), async () => {
        const response = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({ url });
        if (response.ok) {
            return response.body.definition;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw response.error;
        }
    });
}

function buildQueryKey(domain: string): TypedQueryKey<FernRegistryDocsRead.DocsDefinition> {
    const queryKey = ["docs", { domain }];
    return TypedQueryKey.of(queryKey);
}
