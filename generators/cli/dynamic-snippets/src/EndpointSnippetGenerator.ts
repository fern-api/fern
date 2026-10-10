import {
    AbstractAstNode,
    AbstractWriter,
    CodeBlock,
    Options,
    Severity
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";

import { CliCommandBuilder, isPlainObject } from "./command.js";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext.js";
import { flagSourceName, ParameterLocation, resolveMultipartFieldFlagName, resolveParamFlagName } from "./naming.js";

export class EndpointSnippetGenerator {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public async generateSnippet({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): Promise<string> {
        return this.buildCommand({ endpoint, snippet: request });
    }

    public generateSnippetSync({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        return this.buildCommand({ endpoint, snippet: request });
    }

    public async generateSnippetAst({
        endpoint,
        request
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<AbstractAstNode> {
        return new CodeBlock<AbstractWriter>(this.buildCommand({ endpoint, snippet: request }));
    }

    private buildCommand({
        endpoint,
        snippet
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): string {
        const builder = new CliCommandBuilder(this.context.getCommandPrefix(endpoint));

        // Auth is read from the environment (e.g. <BINARY>_API_KEY / per-binding env vars) rather than
        // rendered as flags, mirroring how the Rust CLI resolves credentials; so `snippet.auth` is not
        // emitted here. Global path parameters bound to a client `variable` are likewise configured out
        // of band (env / profile) and omitted, matching the SDK generators.

        switch (endpoint.request.type) {
            case "inlined":
                this.emitInlinedRequest({ builder, request: endpoint.request, snippet });
                break;
            case "body":
                this.emitBodyRequest({ builder, request: endpoint.request, snippet });
                break;
            default:
                assertNever(endpoint.request);
        }

        return builder.build();
    }

    private emitInlinedRequest({
        builder,
        request,
        snippet
    }: {
        builder: CliCommandBuilder;
        request: FernIr.dynamic.InlinedRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): void {
        this.emitPathParameters({ builder, requestPathParameters: request.pathParameters, snippet });
        this.emitNamedParameters({
            builder,
            location: "query",
            parameters: request.queryParameters,
            values: snippet.queryParameters
        });
        this.emitNamedParameters({
            builder,
            location: "header",
            parameters: request.headers,
            values: snippet.headers
        });

        if (request.body != null && snippet.requestBody != null) {
            this.emitInlinedRequestBody({ builder, body: request.body, snippet });
        }
    }

    private emitBodyRequest({
        builder,
        request,
        snippet
    }: {
        builder: CliCommandBuilder;
        request: FernIr.dynamic.BodyRequest;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): void {
        this.emitPathParameters({ builder, requestPathParameters: request.pathParameters, snippet });

        if (request.body != null && snippet.requestBody != null) {
            this.emitReferencedBody({ builder, body: request.body, value: snippet.requestBody });
        }
    }

    /**
     * Path parameters — merged root-level + endpoint-level in IR order. Parameters bound to a client
     * `variable` (globals like an account SID) are configured out of band and skipped.
     */
    private emitPathParameters({
        builder,
        requestPathParameters,
        snippet
    }: {
        builder: CliCommandBuilder;
        requestPathParameters: FernIr.dynamic.NamedParameter[] | undefined;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): void {
        const pathParameters = [...(this.context.ir.pathParameters ?? []), ...(requestPathParameters ?? [])].filter(
            (parameter) => parameter.variable == null
        );
        this.emitNamedParameters({
            builder,
            location: "path",
            parameters: pathParameters,
            values: snippet.pathParameters
        });
    }

    private emitNamedParameters({
        builder,
        location,
        parameters,
        values
    }: {
        builder: CliCommandBuilder;
        location: ParameterLocation;
        parameters: FernIr.dynamic.NamedParameter[] | undefined;
        values: FernIr.dynamic.Values | undefined;
    }): void {
        if (parameters == null || parameters.length === 0) {
            return;
        }
        this.context.errors.scope(scopeLabel(location));
        try {
            const associated = this.context.associateByWireValue({
                parameters,
                values: values ?? {},
                ignoreMissingParameters: true
            });
            for (const instance of associated) {
                this.emitValue({ builder, location, name: instance.name, value: instance.value });
            }
        } finally {
            this.context.errors.unscope();
        }
    }

    private emitInlinedRequestBody({
        builder,
        body,
        snippet
    }: {
        builder: CliCommandBuilder;
        body: FernIr.dynamic.InlinedRequestBody;
        snippet: FernIr.dynamic.EndpointSnippetRequest;
    }): void {
        this.context.errors.scope("Body");
        try {
            switch (body.type) {
                case "properties":
                    this.emitObjectBody({ builder, properties: body.value, value: snippet.requestBody });
                    break;
                case "referenced":
                    this.emitReferencedBody({ builder, body: body.bodyType, value: snippet.requestBody });
                    break;
                case "fileUpload":
                    this.emitObjectBody({
                        builder,
                        properties: fileUploadParameters(body),
                        value: snippet.requestBody,
                        multipart: true
                    });
                    break;
                default:
                    assertNever(body);
            }
        } finally {
            this.context.errors.unscope();
        }
    }

    private emitReferencedBody({
        builder,
        body,
        value
    }: {
        builder: CliCommandBuilder;
        body: FernIr.dynamic.ReferencedRequestBodyType;
        value: unknown;
    }): void {
        switch (body.type) {
            case "typeReference": {
                const properties = this.resolveObjectProperties(body.value);
                if (properties != null) {
                    this.emitObjectBody({ builder, properties, value });
                } else {
                    // Non-object bodies (unions, aliases, maps, arrays, primitives) can't be flattened
                    // into per-field flags. The runtime accepts the whole body — including non-object
                    // JSON like an array or a scalar — through `--json`, so send it verbatim there.
                    builder.setJsonBody(value);
                }
                break;
            }
            case "bytes":
                // The runtime exposes a binary body as a file-path flag (default `--file`/`--body`, or an
                // x-fern-parameter-name override), but the dynamic IR carries no flag metadata to pick it
                // reliably, so the upload argument is omitted. Warn (not fail) so the snippet still renders
                // and docs can flag the gap. See the package README.
                this.context.errors.add({
                    severity: Severity.Warning,
                    message:
                        "Binary (bytes) request body omitted from the CLI snippet: the dynamic IR does not carry the runtime's file-flag metadata."
                });
                break;
            default:
                assertNever(body);
        }
    }

    /**
     * Flatten an object body into per-field flags. When any field's wire name is a *literal* dotted
     * key (e.g. Twilio `Parameter1.Name`) the whole body is sent verbatim through `--json` instead —
     * the runtime mis-nests the dot in both dedicated flags and `--params`, and `--json` can't be
     * combined with per-field body flags.
     */
    private emitObjectBody({
        builder,
        properties,
        value,
        multipart = false
    }: {
        builder: CliCommandBuilder;
        properties: FernIr.dynamic.NamedParameter[];
        value: unknown;
        multipart?: boolean;
    }): void {
        const record = this.context.getRecord(value);
        if (record == null) {
            return;
        }
        if (properties.some((property) => property.name.wireValue.includes("."))) {
            builder.setJsonBody(record);
            return;
        }
        const associated = this.context.associateByWireValue({ parameters: properties, values: record });
        for (const instance of associated) {
            this.emitValue({ builder, location: "body", name: instance.name, value: instance.value, multipart });
        }
    }

    /**
     * Emit one resolved input. Scalars render as `--flag value`; arrays of scalars repeat the flag;
     * objects and arrays-of-objects (and any input the runtime exposes no flag for) route through
     * `--params`. Mirrors the publish-time assembler's routing.
     */
    private emitValue({
        builder,
        location,
        name,
        value,
        multipart = false
    }: {
        builder: CliCommandBuilder;
        location: ParameterLocation;
        name: FernIr.dynamic.NameAndWireValue;
        value: unknown;
        multipart?: boolean;
    }): void {
        // Only a missing input is skipped. An explicit null (e.g. a PATCH body clearing a nullable
        // field) is a value and must survive: it flows through to the flag as `--<flag> null`, which is
        // the runtime's null sentinel for nullable parameters (its value parser maps "null" → JSON
        // null). Dropping it would silently change the request.
        if (value === undefined) {
            return;
        }
        const wireValue = name.wireValue;
        // The flag is derived from the wire name, matching the runtime's default path — including
        // auto-renamed headers (`X-Custom-Header` → `--x-custom-header`). The one exception
        // `flagSourceName` recovers: when the wire name has characters sanitizing would drop (e.g.
        // Twilio's `DateCreated<`), the runtime must be using an explicit `x-fern-parameter-name`
        // rename, so the SDK name is the real source (`dateCreatedBefore` → `--date-created-before`
        // rather than a `--date-created` collision). See the package README for the residual gap.
        //
        // Multipart (file-upload) fields follow the multipart flag rule: a reserved name gets NO flag.
        // `getReservedFlagNames()` adds the config-dependent reservations (renamed user-agent flag,
        // `profile` when profiles are enabled) so a parameter colliding with one gets the `-param` suffix.
        const reserved = this.context.getReservedFlagNames();
        // Multipart fields are never renamed by the runtime (`resolve_multipart_field_flag_name` uses
        // only `to_kebab_flag(wire_name)`), so they always use the wire name. The rename heuristic
        // applies only to ordinary params.
        const flagName = multipart
            ? resolveMultipartFieldFlagName(wireValue, reserved)
            : resolveParamFlagName(
                  { location, displayName: flagSourceName(wireValue, name.name.originalName) },
                  wireValue,
                  reserved
              );
        if (flagName == null) {
            // The field has no flag the runtime will accept, and it can't be supplied through --params
            // either: a non-multipart unsanitizable name (non-ASCII / control chars) has no registered
            // argument at all (passing it in --params panics the CLI), and a reserved-name multipart
            // field is mis-routed by the runtime into the query string instead of the form. In both
            // cases the value can't be delivered correctly, so omit it rather than emit a wrong/failing
            // command — but surface a warning so the docs can flag the dropped field. Both are rare;
            // see the package README.
            this.context.errors.add({
                severity: Severity.Warning,
                message: `Parameter "${wireValue}" was omitted from the CLI snippet: its name cannot be expressed as a flag and the runtime cannot accept it via --params.`
            });
            return;
        }
        // resolveParamFlagName returns the bare flag name (e.g. "account-sid"); the command uses the
        // long-flag spelling "--account-sid".
        const flag = `--${flagName}`;
        if (Array.isArray(value)) {
            if (value.every((element) => !isPlainObject(element) && !Array.isArray(element))) {
                this.warnIfFlagCollision(builder.pushRepeatedFlag(flag, value), flag, wireValue);
            } else {
                builder.routeToParams([wireValue], value);
            }
            return;
        }
        if (isPlainObject(value)) {
            builder.routeToParams([wireValue], value);
            return;
        }
        this.warnIfFlagCollision(builder.pushFlag(flag, value), flag, wireValue);
    }

    /**
     * When two parameters resolve to the same flag the runtime keeps the first and drops the rest; the
     * builder mirrors that by refusing the duplicate. Surface a warning so the dropped value is visible
     * to docs consumers rather than producing a quietly incomplete command (consistent with the
     * omitted-parameter warnings above).
     */
    private warnIfFlagCollision(emitted: boolean, flag: string, wireValue: string): void {
        if (!emitted) {
            this.context.errors.add({
                severity: Severity.Warning,
                message: `Parameter "${wireValue}" was omitted from the CLI snippet: its flag "${flag}" collides with another parameter's and the runtime keeps only the first.`
            });
        }
    }

    /** Resolve a type reference to its object properties, if it names (or aliases) an object type. */
    private resolveObjectProperties(
        typeReference: FernIr.dynamic.TypeReference
    ): FernIr.dynamic.NamedParameter[] | undefined {
        if (typeReference.type !== "named") {
            return undefined;
        }
        const namedType = this.context.resolveNamedType({ typeId: typeReference.value });
        if (namedType == null) {
            return undefined;
        }
        if (namedType.type === "object") {
            return namedType.properties;
        }
        if (namedType.type === "alias") {
            return this.resolveObjectProperties(namedType.typeReference);
        }
        return undefined;
    }
}

function scopeLabel(location: ParameterLocation): string {
    switch (location) {
        case "path":
            return "PathParameters";
        case "query":
            return "QueryParameters";
        case "header":
            return "Headers";
        case "body":
            return "Body";
    }
}

/** File-upload properties, rendered like any other named parameter (file paths become flag values). */
function fileUploadParameters(body: FernIr.dynamic.FileUploadRequestBody): FernIr.dynamic.NamedParameter[] {
    const parameters: FernIr.dynamic.NamedParameter[] = [];
    for (const property of body.properties) {
        switch (property.type) {
            case "bodyProperty":
                parameters.push(property);
                break;
            case "file":
            case "fileArray": {
                // A file field's CLI value is a path string; model it as a plain string parameter.
                // Fully typed (no cast) so the compiler catches any drift in NamedParameter/TypeReference.
                const fileParameter: FernIr.dynamic.NamedParameter = {
                    name: { wireValue: property.wireValue, name: property.name },
                    typeReference: { type: "primitive", value: "STRING" }
                };
                parameters.push(fileParameter);
                break;
            }
            default:
                break;
        }
    }
    return parameters;
}
