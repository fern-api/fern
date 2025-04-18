import { Rule } from "../../Rule";

export const NoMissingAuthRule: Rule = {
    name: "no-missing-auth",
    create: (context) => {
        const authIsDefined = context.workspace.definition.rootApiFile.contents.auth != null;
        return {
            definitionFile: {
                httpService: (service) => {
                    if (service.auth && !authIsDefined) {
                        return [
                            {
                                severity: "fatal",
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
                                severity: "fatal",
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
