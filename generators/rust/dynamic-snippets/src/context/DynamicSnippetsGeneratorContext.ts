import { AbstractDynamicSnippetsGeneratorContext, TypeInstance } from "@fern-api/browser-compatible-base-generator";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { DynamicTypeInstantiationMapper } from "./DynamicTypeInstantiationMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext<DynamicSnippetsGeneratorContext> {
    private typeMapper: DynamicTypeMapper;
    private typeInstantiationMapper: DynamicTypeInstantiationMapper;
    private filePropertyMapper: FilePropertyMapper;
    private packageName: string;

    constructor({
        ir,
        config
    }: {
        ir: FernGeneratorExec.dynamic.IntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
    }) {
        super({ ir, config });
        this.typeMapper = new DynamicTypeMapper({ context: this });
        this.typeInstantiationMapper = new DynamicTypeInstantiationMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });

        // Extract package name from config or use default
        const customConfig = config.customConfig as any;
        this.packageName = customConfig?.packageName ?? ir.apiName?.snakeCase ?? "api_client";
    }

    public getPackageName(): string {
        return this.packageName;
    }

    public hasAuth(): boolean {
        return this.ir.auth != null;
    }

    public resolveEndpoint(
        endpoint: FernGeneratorExec.dynamic.EndpointLocation
    ): FernGeneratorExec.dynamic.Endpoint | undefined {
        const key = `${endpoint.method}_${endpoint.path}`;
        return this.ir.endpoints[key];
    }

    public getTypeInstance(typeReference: FernGeneratorExec.dynamic.TypeReference): TypeInstance {
        return this.typeMapper.convert(typeReference);
    }

    public getTypeInstantiation(typeReference: FernGeneratorExec.dynamic.TypeReference, value: unknown): string {
        return this.typeInstantiationMapper.convert(typeReference, value);
    }

    public getFileProperty(file: FernGeneratorExec.dynamic.FileUploadRequest): string {
        return this.filePropertyMapper.convert(file);
    }

    public toSnakeCase(str: string): string {
        return str
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "")
            .replace(/-/g, "_");
    }

    public toPascalCase(str: string): string {
        return str
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");
    }
}
