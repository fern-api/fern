import { OpenAPIV3_1 } from "openapi-types";

import { AbstractExtension } from "../AbstractExtension.js";

export declare namespace RequireServerVarExtension {
    export interface Args extends AbstractExtension.Args {
        variable: OpenAPIV3_1.ServerVariableObject;
    }
}

export class RequireServerVarExtension extends AbstractExtension<boolean | undefined> {
    private readonly variable: OpenAPIV3_1.ServerVariableObject;
    public readonly key = "x-fern-require-server-var";

    constructor({ breadcrumbs, variable, context }: RequireServerVarExtension.Args) {
        super({ breadcrumbs, context });
        this.variable = variable;
    }

    public convert(): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.variable);
        if (typeof extensionValue !== "boolean") {
            return undefined;
        }

        return extensionValue;
    }
}
