import { Workspace } from "@fern-api/workspace-loader";
import { isEmpty } from "lodash-es";
import { Rule } from "../../Rule";

export const NoMissingErrorDiscriminantRule: Rule = {
    name: "no-missing-error-discriminant",
    disabled: true,
    create: async ({ workspace }) => {
        if (!doesApiDeclareErrors(workspace)) {
            return {};
        }

        return {
            rootApiFile: {
                errorDiscriminant: (errorDiscriminant) => {
                    if (errorDiscriminant != null) {
                        return [];
                    }

                    return [
                        {
                            severity: "error",
                            message: "Error discriminant is required because this API includes error declarations.",
                        },
                    ];
                },
            },
        };
    },
};

function doesApiDeclareErrors(workspace: Workspace): boolean {
    for (const file of Object.values(workspace.serviceFiles)) {
        if (file.errors != null && !isEmpty(file.errors)) {
            return true;
        }
    }
    return false;
}
