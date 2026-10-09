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
import { ParameterLocation, resolveParamFlagName } from "./naming.js";

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
        const associated = this.context.associateByWireValue({
            parameters,
            values: values ?? {},
            ignoreMissingParameters: true
        });
        for (const instance of associated) {
            this.emitValue({ builder, location, wireValue: instance.name.wireValue, value: instance.value });
        }
        this.context.errors.unscope();
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
                    value: snippet.requestBody
                });
                break;
            default:
                assertNever(body);
        }
        this.context.errors.unscope();
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
                    // Non-object bodies (unions, aliases, containers, primitives) can't be flattened into
                    // per-field flags; the runtime accepts them through the `--params` catch-all.
                    this.routeWholeBody({ builder, value });
                }
                break;
            }
            case "bytes":
                this.context.errors.add({
                    severity: Severity.Critical,
                    message: "Binary (bytes) request bodies are not supported in CLI snippets"
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
        value
    }: {
        builder: CliCommandBuilder;
        properties: FernIr.dynamic.NamedParameter[];
        value: unknown;
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
            this.emitValue({ builder, location: "body", wireValue: instance.name.wireValue, value: instance.value });
        }
    }

    private routeWholeBody({ builder, value }: { builder: CliCommandBuilder; value: unknown }): void {
        const record = this.context.getRecord(value);
        if (record == null) {
            return;
        }
        if (Object.keys(record).some((key) => key.includes("."))) {
            builder.setJsonBody(record);
            return;
        }
        for (const [key, entry] of Object.entries(record)) {
            if (entry !== undefined) {
                builder.routeToParams([key], entry);
            }
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
        wireValue,
        value
    }: {
        builder: CliCommandBuilder;
        location: ParameterLocation;
        wireValue: string;
        value: unknown;
    }): void {
        if (value === undefined || value === null) {
            return;
        }
        const flagName = resolveParamFlagName({ location }, wireValue);
        if (flagName == null) {
            builder.routeToParams([wireValue], value);
            return;
        }
        // resolveParamFlagName returns the bare flag name (e.g. "account-sid"); the command uses the
        // long-flag spelling "--account-sid".
        const flag = `--${flagName}`;
        if (Array.isArray(value)) {
            if (value.every((element) => !isPlainObject(element) && !Array.isArray(element))) {
                builder.pushRepeatedFlag(flag, value);
            } else {
                builder.routeToParams([wireValue], value);
            }
            return;
        }
        if (isPlainObject(value)) {
            builder.routeToParams([wireValue], value);
            return;
        }
        builder.pushFlag(flag, value);
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
            case "fileArray":
                parameters.push({
                    name: { wireValue: property.wireValue, name: property.name },
                    typeReference: { type: "primitive", value: "STRING" }
                } as FernIr.dynamic.NamedParameter);
                break;
            default:
                break;
        }
    }
    return parameters;
}
