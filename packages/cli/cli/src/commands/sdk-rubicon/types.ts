import type { SdkConfigIrV1 } from "@postman/sdk-config";

export interface RubiconDiagnostic {
    severity: "error" | "warning";
    /** SDK Config path, for example `api.auth.schemes[0].location`. */
    path: string;
    code: string;
    message: string;
    /** What the user can do about it. */
    action?: string;
}

export interface SpecSecurityScheme {
    type?: string;
    in?: string;
    name?: string;
    scheme?: string;
}

export interface SpecPostOperation {
    requestProperties: string[];
    responseProperties: string[];
}

/** Small facts read from one spec after Fern has applied its overrides and overlay. */
export interface SpecFacts {
    securitySchemes: Record<string, SpecSecurityScheme>;
    /** Lowercased header names the spec sends. */
    declaredHeaders: string[];
    /** Lowercased keys of header API-key security schemes; see the migrate compensation in rules/headers.ts. */
    schemeKeys: string[];
    /** Keyed by path, for example `/token`. */
    postOperations: Record<string, SpecPostOperation>;
    serverUrls: string[];
}

export interface MapperInput {
    /** Folder of sdk-config.yml; spec paths in the IR are relative to it. */
    configDir: string;
    /** Folder of the written generators.yml; paths in it are relative to this folder. */
    outDir: string;
    /** Facts for `ir.source.specs[i]`, or undefined when the spec could not be read. */
    specFacts: Array<SpecFacts | undefined>;
    /** The resolved fern-cli-generator version (see versions.ts). */
    generatorVersion: string;
}

/** Several overlays for one spec, merged by the writer into `path` (absolute). */
export interface OverlayMerge {
    path: string;
    overlayPaths: string[];
}

export interface MapperOutput {
    generatorsYml: Record<string, unknown>;
    overlayMerges: OverlayMerge[];
    diagnostics: RubiconDiagnostic[];
    hints: string[];
}

export interface RuleContext {
    ir: SdkConfigIrV1;
    input: MapperInput;
    output: MapperOutput;
    error(path: string, code: string, message: string, action?: string): void;
    warn(path: string, code: string, message: string, action?: string): void;
}

/** A rule owns a set of Map leaf paths (schema form) and writes their effect into the output. */
export interface MapperRule {
    name: string;
    paths: readonly string[];
    apply(context: RuleContext): void;
}
