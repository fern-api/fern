namespace SeedApi;

public partial interface ISeedApiClient
{
    /// <summary>
    /// Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string literal, number literal, and object data payloads.
    /// </summary>
    IAsyncEnumerable<StreamProtocolNoCollisionResponse> StreamProtocolNoCollisionAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level discriminant from the data-level field when context=protocol is specified.
    /// </summary>
    IAsyncEnumerable<StreamProtocolCollisionResponse> StreamProtocolCollisionAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by customers with context=data.
    /// </summary>
    IAsyncEnumerable<StreamDataContextResponse> StreamDataContextAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.
    /// </summary>
    IAsyncEnumerable<StreamNoContextResponse> StreamNoContextAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to flatten the event field alongside payload fields instead of wrapping them in a data field.
    /// </summary>
    IAsyncEnumerable<StreamProtocolWithFlatSchemaResponse> StreamProtocolWithFlatSchemaAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Mismatched combination: context=data with the envelope+data schema pattern that is normally used with context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the event field and data field into an envelope structure.
    /// </summary>
    IAsyncEnumerable<StreamDataContextWithEnvelopeSchemaResponse> StreamDataContextWithEnvelopeSchemaAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution relies on const matching.
    /// </summary>
    IAsyncEnumerable<Event> StreamOasSpecNativeAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
    /// </summary>
    IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingConditionStreamAsync(
        StreamXFernStreamingConditionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
    /// </summary>
    WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingConditionAsync(
        StreamXFernStreamingConditionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
    /// </summary>
    IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingSharedSchemaStreamAsync(
        StreamXFernStreamingSharedSchemaStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
    /// </summary>
    WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingSharedSchemaAsync(
        StreamXFernStreamingSharedSchemaRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// A non-streaming endpoint that references the same SharedCompletionRequest schema as endpoint 10. Ensures the shared $ref schema remains available and is not excluded during the streaming endpoint's processing.
    /// </summary>
    WithRawResponseTask<CompletionFullResponse> ValidateCompletionAsync(
        SharedCompletionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    /// </summary>
    IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingUnionStreamAsync(
        StreamXFernStreamingUnionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    /// </summary>
    WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingUnionAsync(
        StreamXFernStreamingUnionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// References UnionStreamRequestBase directly, ensuring the base schema cannot be excluded from the context. This endpoint exists to verify that shared base schemas used in discriminated union variants with stream-condition remain available.
    /// </summary>
    WithRawResponseTask<ValidateUnionRequestResponse> ValidateUnionRequestAsync(
        UnionStreamRequestBase request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
    /// </summary>
    IAsyncEnumerable<CompletionStreamChunk> StreamXFernStreamingNullableConditionStreamAsync(
        StreamXFernStreamingNullableConditionStreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
    /// </summary>
    WithRawResponseTask<CompletionFullResponse> StreamXFernStreamingNullableConditionAsync(
        StreamXFernStreamingNullableConditionRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Uses x-fern-streaming with format: sse but no stream-condition. This represents a stream-only endpoint that always returns SSE. There is no non-streaming variant, and the response is always a stream of chunks.
    /// </summary>
    IAsyncEnumerable<string> StreamXFernStreamingSseOnlyAsync(
        StreamRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
