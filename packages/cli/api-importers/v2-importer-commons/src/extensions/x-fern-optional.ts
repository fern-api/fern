import { OpenAPIV3_1 } from "openapi-types";

import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";

export declare namespace FernOptionalExtension {
    export interface Args extends AbstractExtension.Args {
        parameter: OpenAPIV3_1.ParameterObject;
    }
}

export class FernOptionalExtension extends AbstractExtension<boolean> {
    private readonly parameter: object;
    public readonly key = "x-fern-optional";

    constructor({ breadcrumbs, parameter }: FernOptionalExtension.Args) {
        super({ breadcrumbs });
        this.parameter = parameter;
    }

    public convert({ errorCollector }: { errorCollector: ErrorCollector }): boolean | undefined {
        const extensionValue = this.getExtensionValue(this.parameter);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue !== "boolean") {
            errorCollector.collect({
                message: "Received unexpected non-boolean value for x-fern-optional",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
