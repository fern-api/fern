import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-api/react-query-utils";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { REGISTRY_SERVICE } from "../services/registry";

export function useDocs(domain: string): Loadable<FernRegistryDocsRead.DocsDefinition> {
    return useTypedQuery(buildQueryKey(domain), async () => {
        const response = await REGISTRY_SERVICE.docs.v1.read.getDocsForDomain({ domain });
        if (response.ok) {
            return response.body;
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
