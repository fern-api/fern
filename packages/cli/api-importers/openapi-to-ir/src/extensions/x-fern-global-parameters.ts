import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernGlobalParametersExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }

    export interface GlobalParameterExtension {
        name: string;
        in?: string;
        target?: string;
        "parameter-name"?: string;
        optional?: boolean;
        env?: string;
        default?: string | boolean | number;
        type?: string;
        apply?: string;
    }
}

export class FernGlobalParametersExtension extends AbstractExtension<
    FernGlobalParametersExtension.GlobalParameterExtension[]
> {
    private readonly document: object;
    public readonly key = "x-fern-global-parameters";

    constructor({ breadcrumbs, document, context }: FernGlobalParametersExtension.Args) {
        super({ breadcrumbs, context });
        this.document = document;
    }

    public convert(): FernGlobalParametersExtension.GlobalParameterExtension[] | undefined {
        const extensionValue = this.getExtensionValue(this.document);
        if (extensionValue == null) {
            return undefined;
        }

        if (!Array.isArray(extensionValue)) {
            this.context.errorCollector.collect({
                message: "Received unexpected non-array value for x-fern-global-parameters",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return extensionValue;
    }
}
