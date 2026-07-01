import { AbstractExtension } from "@fern-api/v3-importer-commons";

export declare namespace FernGlobalParametersExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
    }

    export interface GlobalParameterExtension {
        name: string;
        in: string | undefined;
        target: string | undefined;
        env: string | undefined;
        default: string | boolean | undefined;
        optional: boolean | undefined;
        apply: string | undefined;
        type: string | undefined;
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

        const result: FernGlobalParametersExtension.GlobalParameterExtension[] = [];
        for (const [index, item] of extensionValue.entries()) {
            if (typeof item !== "object" || item == null || Array.isArray(item)) {
                this.context.errorCollector.collect({
                    message: `x-fern-global-parameters[${index}] must be an object`,
                    path: [...this.breadcrumbs, `${index}`]
                });
                continue;
            }
            const entry = item as Record<string, unknown>;
            if (typeof entry["name"] !== "string") {
                this.context.errorCollector.collect({
                    message: `x-fern-global-parameters[${index}].name is required and must be a string`,
                    path: [...this.breadcrumbs, `${index}`, "name"]
                });
                continue;
            }
            result.push({
                name: entry["name"] as string,
                in: typeof entry["in"] === "string" ? (entry["in"] as string) : undefined,
                target: typeof entry["target"] === "string" ? (entry["target"] as string) : undefined,
                env: typeof entry["env"] === "string" ? (entry["env"] as string) : undefined,
                default:
                    typeof entry["default"] === "string" || typeof entry["default"] === "boolean"
                        ? (entry["default"] as string | boolean)
                        : undefined,
                optional: typeof entry["optional"] === "boolean" ? (entry["optional"] as boolean) : undefined,
                apply: typeof entry["apply"] === "string" ? (entry["apply"] as string) : undefined,
                type: typeof entry["type"] === "string" ? (entry["type"] as string) : undefined
            });
        }
        return result.length > 0 ? result : undefined;
    }
}
