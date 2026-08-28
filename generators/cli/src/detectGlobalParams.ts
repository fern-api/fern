import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * One global parameter binding to emit in the generated `main.rs`.
 * Each binding maps to a `.global_parameter(GlobalParameter { ... })`
 * call on the `CliApp` builder — mirroring the `DetectedAuthBinding`
 * pattern used for auth schemes.
 */
export interface DetectedGlobalParam {
    /** Canonical parameter name (used as the CLI flag base). */
    paramName: string;
    /** Literal Rust struct-expression for the `GlobalParameter` value. */
    rustCall: string;
    /** Rust `use` imports needed for this binding. */
    imports: string[];
    /** Environment variable name the flag falls back to, if any. */
    envVar: string | undefined;
}

/**
 * Visit each entry in the IR's `globalParameters` plus its API-wide
 * `headers` and emit a `DetectedGlobalParam` for every supported
 * parameter.
 *
 * API-wide headers (the root API file / `generators.yml` `headers:` block,
 * i.e. `x-fern-global-headers`) are header-location global parameters with
 * `auto` apply: they are sent on every request. They live in `ir.headers`
 * rather than `ir.globalParameters`, and the copied raw OpenAPI specs the
 * Rust runtime parses don't carry them, so the generator has to wire them
 * explicitly. A `globalParameters` entry targeting the same header wins —
 * it is the richer declaration.
 *
 * Each detected param produces a `.global_parameter(GlobalParameter { ... })`
 * builder call that the `renderMainRs` layer splices into the
 * `CliApp::new(...)` chain. The Rust SDK's runtime then registers the
 * global CLI flag and injects the resolved value into outgoing requests
 * at the declared wire location.
 */
export function detectGlobalParams(args: {
    globalParameters: FernIr.GlobalParameter[] | undefined;
    apiWideHeaders?: FernIr.HttpHeader[] | undefined;
}): DetectedGlobalParam[] {
    const { globalParameters, apiWideHeaders } = args;

    const bindings: DetectedGlobalParam[] = [];
    const declaredHeaderTargets = new Set<string>();
    for (const param of globalParameters ?? []) {
        if (param.location === "header") {
            declaredHeaderTargets.add(param.target.toLowerCase());
        }
        bindings.push(buildBinding(param));
    }
    for (const header of apiWideHeaders ?? []) {
        const binding = buildHeaderBinding(header);
        if (binding == null || declaredHeaderTargets.has(binding.paramName.toLowerCase())) {
            continue;
        }
        declaredHeaderTargets.add(binding.paramName.toLowerCase());
        bindings.push(binding);
    }
    return bindings;
}

function locationToRust(location: FernIr.GlobalParameterLocation): string {
    return FernIr.GlobalParameterLocation._visit<string>(location, {
        header: () => "GlobalParameterLocation::Header",
        query: () => "GlobalParameterLocation::Query",
        body: () => "GlobalParameterLocation::Body",
        path: () => "GlobalParameterLocation::Path",
        _other: () => "GlobalParameterLocation::Query"
    });
}

function applyModeToRust(apply: FernIr.GlobalParameterApplyMode | undefined): string {
    if (apply == null) {
        return "GlobalParameterApplyMode::Explicit";
    }
    return FernIr.GlobalParameterApplyMode._visit<string>(apply, {
        explicit: () => "GlobalParameterApplyMode::Explicit",
        auto: () => "GlobalParameterApplyMode::Auto",
        _other: () => "GlobalParameterApplyMode::Explicit"
    });
}

function escapeRustString(s: string): string {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function optionString(value: string | undefined): string {
    if (value == null) {
        return "None";
    }
    return `Some("${escapeRustString(value)}".into())`;
}

function optionLiteralDefault(literal: FernIr.Literal | undefined): string {
    if (literal == null) {
        return "None";
    }
    // Literal is a union with string and boolean variants.
    // Both are stored as string in the Rust SDK's GlobalParameter.default.
    return literal._visit<string>({
        string: (s) => `Some("${escapeRustString(s)}".into())`,
        boolean: (b) => `Some("${b}".into())`,
        _other: () => "None"
    });
}

/**
 * Extract the canonical wire name and optional SDK-facing name from
 * the IR's `NameAndWireValueOrString` union.
 */
function resolveParamName(nameField: FernIr.NameAndWireValueOrString): {
    wireValue: string;
    sdkName: string | undefined;
} {
    if (typeof nameField === "string") {
        return { wireValue: nameField, sdkName: undefined };
    }
    // NameAndWireValue — extract wireValue and the SDK name.
    const sdkNameValue = typeof nameField.name === "string" ? nameField.name : nameField.name.originalName;
    return {
        wireValue: nameField.wireValue,
        sdkName: sdkNameValue !== nameField.wireValue ? sdkNameValue : undefined
    };
}

/**
 * Whether a header's declared type makes it optional on the wire —
 * `optional<string>` / `nullable<string>` headers may be omitted, while a
 * bare `string` header must be resolvable or the CLI errors up front.
 * Literal-typed headers are constants, so they too need no caller input.
 */
function headerIsOptional(valueType: FernIr.TypeReference): boolean {
    return visitDiscriminatedUnion(valueType)._visit<boolean>({
        container: ({ container }) =>
            visitDiscriminatedUnion(container)._visit<boolean>({
                optional: () => true,
                nullable: () => true,
                literal: () => true,
                list: () => false,
                map: () => false,
                set: () => false,
                _other: () => false
            }),
        named: () => false,
        primitive: () => false,
        unknown: () => false,
        _other: () => false
    });
}

/**
 * The value a literal-typed header always sends, so it needs no flag value.
 */
function headerLiteralValue(valueType: FernIr.TypeReference): FernIr.Literal | undefined {
    return visitDiscriminatedUnion(valueType)._visit<FernIr.Literal | undefined>({
        container: ({ container }) =>
            visitDiscriminatedUnion(container)._visit<FernIr.Literal | undefined>({
                literal: ({ literal }) => literal,
                optional: () => undefined,
                nullable: () => undefined,
                list: () => undefined,
                map: () => undefined,
                set: () => undefined,
                _other: () => undefined
            }),
        named: () => undefined,
        primitive: () => undefined,
        unknown: () => undefined,
        _other: () => undefined
    });
}

/**
 * Lower an API-wide header into a header-location global parameter with
 * `auto` apply (sent on every request). Returns `undefined` when the
 * header has no usable wire name.
 */
function buildHeaderBinding(header: FernIr.HttpHeader): DetectedGlobalParam | undefined {
    const { wireValue, sdkName } = resolveParamName(header.name);
    if (wireValue.length === 0) {
        return undefined;
    }

    const defaultRust = optionLiteralDefault(header.clientDefault ?? headerLiteralValue(header.valueType));
    const rustCall = [
        `.global_parameter(GlobalParameter {`,
        `            name: "${escapeRustString(wireValue)}".into(),`,
        `            location: GlobalParameterLocation::Header,`,
        `            target: "${escapeRustString(wireValue)}".into(),`,
        `            env: ${optionString(header.env)},`,
        `            default: ${defaultRust},`,
        `            optional: ${headerIsOptional(header.valueType) ? "true" : "false"},`,
        `            apply: GlobalParameterApplyMode::Auto,`,
        `            parameter_name: ${optionString(sdkName)},`,
        `            docs: ${optionString(header.docs)},`,
        `        })`
    ].join("\n");

    return {
        paramName: wireValue,
        rustCall,
        imports: ["GlobalParameter", "GlobalParameterLocation", "GlobalParameterApplyMode"],
        envVar: header.env ?? undefined
    };
}

function buildBinding(param: FernIr.GlobalParameter): DetectedGlobalParam {
    const { wireValue, sdkName } = resolveParamName(param.name);

    // The wire-level target where the value is injected.
    const target = param.target;

    // parameter_name: the SDK-facing name override (from parameter-name extension).
    const parameterName = sdkName;

    const locationRust = locationToRust(param.location);
    const applyRust = applyModeToRust(param.apply);
    const envRust = optionString(param.env);
    const defaultRust = optionLiteralDefault(param.clientDefault);
    const optionalRust = param.optional === true ? "true" : "false";
    const paramNameRust = optionString(parameterName);
    const docsRust = optionString(param.docs);

    // The first line is emitted at the caller's indentation (8 spaces, on
    // the root `CliApp` chain); subsequent lines carry absolute indentation
    // so the struct nests cleanly one level in (fields at 12, close at 8).
    const rustCall = [
        `.global_parameter(GlobalParameter {`,
        `            name: "${escapeRustString(wireValue)}".into(),`,
        `            location: ${locationRust},`,
        `            target: "${escapeRustString(target)}".into(),`,
        `            env: ${envRust},`,
        `            default: ${defaultRust},`,
        `            optional: ${optionalRust},`,
        `            apply: ${applyRust},`,
        `            parameter_name: ${paramNameRust},`,
        `            docs: ${docsRust},`,
        `        })`
    ].join("\n");

    return {
        paramName: wireValue,
        rustCall,
        imports: ["GlobalParameter", "GlobalParameterLocation", "GlobalParameterApplyMode"],
        envVar: param.env ?? undefined
    };
}
