import { truthy } from "@stoplight/spectral-functions";
import { SpectralRule } from "../Rule";

export const OperationIdRequired: SpectralRule = {
    name: "valid-service-urls",
    get: () => {
        return {
            given: "$.paths.*.*",
            message: "operationId is required",
            then: {
                field: "operationId",
                function: truthy,
            },
        };
    },
};
