import { truthy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const OperationIdRequired: SpectralRule = {
    name: "valid-service-urls",
    get: () => {
        return {
            given: "$.paths.*.*",
            message: "Endpoint is missing operationId.",
            then: {
                field: "operationId",
                function: truthy,
            },
        };
    },
};
