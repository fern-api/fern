import { SpectralRule } from "../Rule";

export const ServerNameIsPresent: SpectralRule = {
    name: "server-name-is-present",
    get: () => {
        return {
            given: ["$.servers[*]"],
            message: "",
            resolved: false,
            then: [
                {
                    function: (schema, _, { path }) => {
                        if (schema.url == null) {
                            return;
                        }

                        const results: IFunctionResult[] = [];

                        if (schema["x-server-name"] == null) {
                            results.push({
                                message: `Please specify a name for the server on ${schema.url}. Use the property x-server-name.`,
                                path: [...path],
                            });
                        }

                        return results;
                    },
                },
            ],
        };
    },
};
