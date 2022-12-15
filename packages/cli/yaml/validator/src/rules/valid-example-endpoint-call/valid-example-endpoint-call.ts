import { Rule } from "../../Rule";

export const ValidExampleEndpointCallRule: Rule = {
    name: "valid-example-endpoint-call",
    create: () => {
        return {
            serviceFile: {
                exampleHttpEndpointCall: () => {
                    return [];
                },
            },
        };
    },
};
