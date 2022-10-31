import { Loadable } from "@fern-api/loadable";
import { TypedQueryKey, useTypedQuery } from "@fern-ui/react-query-utils";
import { LightweightAPI, MockBackend } from "../../mock-backend/MockBackend";

const MOCK_BACKEND = new MockBackend();

const API_QUERY_KEY: TypedQueryKey<LightweightAPI> = TypedQueryKey.of(["api"]);

export function useLightweightAPI(): Loadable<LightweightAPI> {
    return useTypedQuery(API_QUERY_KEY, () => MOCK_BACKEND.getLightweightAPI());
}
