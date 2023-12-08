import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/finalIr";
import { camelCase } from "lodash-es";
import { basename, extname } from "path";

export interface FernDefinitionBuilder {
    addAuthScheme({ name, schema }: { name: string; schema: RawSchemas.AuthSchemeDeclarationSchema }): void;

    setAuth(name: string): void;

    getGlobalHeaderNames(): Set<string>;

    addGlobalHeader({ name, schema }: { name: string; schema: RawSchemas.HttpHeaderSchema }): void;

    addEnvironment({ name, schema }: { name: string; schema: RawSchemas.EnvironmentSchema }): void;

    setDefaultEnvironment(name: string): void;

    addAudience(name: string): void;

    /**
     * Adds an import and returns the prefix for the import
     * @param file the file to add the import to
     * @param fileToImport the file to import
     */
    addImport({ file, fileToImport }: { file: RelativeFilePath; fileToImport: RelativeFilePath }): string;

    addType(file: RelativeFilePath, { name, schema }: { name: string; schema: RawSchemas.TypeDeclarationSchema }): void;

    addError(
        file: RelativeFilePath,
        { name, schema }: { name: string; schema: RawSchemas.ErrorDeclarationSchema }
    ): void;

    addEndpoint(
        file: RelativeFilePath,
        { name, schema }: { name: string; schema: RawSchemas.HttpEndpointSchema }
    ): void;

    addWebhook(file: RelativeFilePath, { name, schema }: { name: string; schema: RawSchemas.WebhookSchema }): void;

    setServiceDisplayName(file: RelativeFilePath, name: string): void;

    build(): FernDefinition;
}

export interface FernDefinition {
    rootApiFile: RawSchemas.RootApiFileSchema;
    packageMarkerFile: RawSchemas.PackageMarkerFileSchema;
    definitionFiles: Record<RelativeFilePath, RawSchemas.DefinitionFileSchema>;
}

export class FernDefinitionBuilderImpl implements FernDefinitionBuilder {
    private rootApiFile: RawSchemas.RootApiFileSchema;
    private packageMarkerFile: RawSchemas.PackageMarkerFileSchema = {};
    private definitionFiles: Record<RelativeFilePath, RawSchemas.DefinitionFileSchema> = {};

    public constructor(ir: OpenAPIIntermediateRepresentation) {
        this.rootApiFile = {
            name: "api",
            "error-discrimination": {
                strategy: "status-code"
            }
        };
        if (ir.title != null) {
            this.rootApiFile["display-name"] = ir.title;
        }
    }

    public setServiceDisplayName(file: RelativeFilePath, name: string): void {
        const fernFile = this.getOrCreateFile(file);
        if (fernFile.service == null) {
            fernFile.service = {
                auth: false,
                "base-path": "",
                endpoints: {}
            };
        }
        fernFile.service["display-name"] = name;
    }

    public addAudience(name: string): void {
        if (this.rootApiFile.audiences == null) {
            this.rootApiFile.audiences = [];
        }
        this.rootApiFile.audiences.push(name);
    }

    public setAuth(name: string): void {
        this.rootApiFile.auth = name;
    }

    public getGlobalHeaderNames(): Set<string> {
        return new Set(...Object.keys(this.rootApiFile.headers ?? {}));
    }

    public addAuthScheme({ name, schema }: { name: string; schema: RawSchemas.AuthSchemeDeclarationSchema }): void {
        if (this.rootApiFile["auth-schemes"] == null) {
            this.rootApiFile["auth-schemes"] = {};
        }
        this.rootApiFile["auth-schemes"][name] = schema;
    }

    public setDefaultEnvironment(name: string): void {
        this.rootApiFile["default-environment"] = name;
    }

    public addEnvironment({ name, schema }: { name: string; schema: RawSchemas.EnvironmentSchema }): void {
        if (this.rootApiFile.environments == null) {
            this.rootApiFile.environments = {};
        }
        this.rootApiFile.environments[name] = schema;
    }

    public addGlobalHeader({ name, schema }: { name: string; schema: RawSchemas.HttpHeaderSchema }): void {
        if (this.rootApiFile.headers == null) {
            this.rootApiFile.headers = {};
        }
        this.rootApiFile.headers[name] = schema;
    }

    public addImport({ file, fileToImport }: { file: RelativeFilePath; fileToImport: RelativeFilePath }): string {
        const importPrefix = camelCase(basename(fileToImport, extname(fileToImport)).replace("__package__", "root"));
        const fernFile = this.getOrCreateFile(file);
        if (fernFile.imports == null) {
            fernFile.imports = {};
        }
        fernFile.imports[importPrefix] = fileToImport;
        return importPrefix;
    }

    public addType(
        file: RelativeFilePath,
        { name, schema }: { name: string; schema: RawSchemas.TypeDeclarationSchema }
    ): void {
        const fernFile = this.getOrCreateFile(file);
        if (fernFile.types == null) {
            fernFile.types = {};
        }
        fernFile.types[name] = schema;
    }

    public addError(
        file: RelativeFilePath,
        { name, schema }: { name: string; schema: RawSchemas.ErrorDeclarationSchema }
    ): void {
        const fernFile = this.getOrCreateFile(file);
        if (fernFile.errors == null) {
            fernFile.errors = {};
        }
        fernFile.errors[name] = schema;
    }

    public addEndpoint(
        file: RelativeFilePath,
        { name, schema }: { name: string; schema: RawSchemas.HttpEndpointSchema }
    ): void {
        const fernFile = this.getOrCreateFile(file);
        if (fernFile.service == null) {
            fernFile.service = {
                auth: false,
                "base-path": "",
                endpoints: {}
            };
        }
        fernFile.service.endpoints[name] = schema;
    }

    public addWebhook(
        file: RelativeFilePath,
        { name, schema }: { name: string; schema: RawSchemas.WebhookSchema }
    ): void {
        const fernFile = this.getOrCreateFile(file);
        if (fernFile.webhooks == null) {
            fernFile.webhooks = {};
        }
        fernFile.webhooks[name] = schema;
    }

    public build(): FernDefinition {
        return {
            rootApiFile: this.rootApiFile,
            packageMarkerFile: this.packageMarkerFile,
            definitionFiles: this.definitionFiles
        };
    }

    public getOrCreateFile(
        file: RelativeFilePath
    ): RawSchemas.PackageMarkerFileSchema | RawSchemas.DefinitionFileSchema {
        if (file === FERN_PACKAGE_MARKER_FILENAME) {
            return this.packageMarkerFile;
        } else {
            return (this.definitionFiles[file] ??= {});
        }
    }
}

// // when building the fern definition try to extract as much of the shared prefix environment url
// // into the endpoint path
// function getPathname(url: string): string {
//     const parsedUrl = new URL(url);
//     const pathname = parsedUrl.pathname;
//     if (pathname.endsWith("/")) {
//         return pathname.slice(0, -1);
//     } else {
//         return pathname;
//     }
// }

// function getSharedSuffix(strings: string[]): string {
//     let suffix = "";

//     // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
//     while (true) {
//         const chars = strings.map((s) => s[s.length - suffix.length - 1]);
//         const char = chars[0];
//         if (char == null || chars.some((c) => c !== char)) {
//             break;
//         }
//         suffix = char + suffix;
//     }

//     return suffix;
// }
