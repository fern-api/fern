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
 * Visit each entry in the IR's `globalParameters` and emit a
 * `DetectedGlobalParam` for every supported parameter.
 *
 * Each detected param produces a `.global_parameter(GlobalParameter { ... })`
 * builder call that the `renderMainRs` layer splices into the
 * `CliApp::new(...)` chain. The Rust SDK's runtime then registers the
 * global CLI flag and injects the resolved value into outgoing requests
 * at the declared wire location.
 */
export function detectGlobalParams(args: {
    globalParameters: FernIr.GlobalParameter[] | undefined;
}): DetectedGlobalParam[] {
    const { globalParameters } = args;
    if (globalParameters == null || globalParameters.length === 0) {
        return [];
    }

    const bindings: DetectedGlobalParam[] = [];
    for (const param of globalParameters) {
        bindings.push(buildBinding(param));
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
    ].join("\n        ");

    return {
        paramName: wireValue,
        rustCall,
        imports: ["GlobalParameter", "GlobalParameterLocation", "GlobalParameterApplyMode"],
        envVar: param.env ?? undefined
    };
}
