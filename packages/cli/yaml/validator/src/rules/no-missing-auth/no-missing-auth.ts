import { Rule } from "../../Rule";

export const NoMissingAuthRule: Rule = {
    name: "no-missing-auth",
    create: async (context) => {
        const authIsDefined = (await context.workspace.getDefinition()).rootApiFile.contents.auth != null;
        return {
            definitionFile: {
                httpService: (service) => {
                    if (service.auth && !authIsDefined) {
                        return [
                            {
                                severity: "error",
                                message: "Service requires auth, but no auth is defined."
                            }
                        ];
                    }
                    return [];
                },
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.auth != null && endpoint.auth && !authIsDefined) {
                        return [
                            {
                                severity: "error",
                                message: "Endpoint requires auth, but no auth is defined."
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
