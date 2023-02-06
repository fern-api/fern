import { SpectralRule } from "../Rule";

const X_REQUEST_NAME_FIELD = "X-request-name";

export const RequestName: SpectralRule = {
    name: "request-name",
    get: () => {
        return {
            given: ["$.paths.*.*"],
            resolved: false,
            then: [
                {
                    function: (schema, _, { path }) => {
                        if (schema.parameters == null) {
                            return;
                        }

                        const hasQueryParameters = schema.parameters.some(
                            (parameter: { in?: string }) => parameter.in === "query"
                        );
                        if (!hasQueryParameters || schema[X_REQUEST_NAME_FIELD] != null) {
                            return;
                        }

                        return [
                            {
                                message: `${X_REQUEST_NAME_FIELD} is required because this request has query parameters`,
                                path,
                            },
                        ];
                    },
                },
            ],
        };
    },
};
