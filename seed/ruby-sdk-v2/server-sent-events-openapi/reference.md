# Reference
<details><summary><code>client.<a href="/lib/seed/client.rb">stream_protocol_no_collision</a>(request) -> Seed::Types::StreamProtocolNoCollisionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string literal, number literal, and object data payloads.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_protocol_no_collision
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_protocol_collision</a>(request) -> Seed::Types::StreamProtocolCollisionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level discriminant from the data-level field when context=protocol is specified.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_protocol_collision
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_data_context</a>(request) -> Seed::Types::StreamDataContextResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by customers with context=data.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_data_context
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_no_context</a>(request) -> Seed::Types::StreamNoContextResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_no_context
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_protocol_with_flat_schema</a>(request) -> Seed::Types::StreamProtocolWithFlatSchemaResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to flatten the event field alongside payload fields instead of wrapping them in a data field.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_protocol_with_flat_schema
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_data_context_with_envelope_schema</a>(request) -> Seed::Types::StreamDataContextWithEnvelopeSchemaResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Mismatched combination: context=data with the envelope+data schema pattern that is normally used with context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the event field and data field into an envelope structure.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_data_context_with_envelope_schema
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_oas_spec_native</a>(request) -> Seed::Types::Event</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution relies on const matching.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_oas_spec_native
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_condition_stream</a>(request) -> Seed::Types::CompletionStreamChunk</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_condition_stream(
  query: "query",
  stream: true
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**query:** `String` — The prompt or query to complete.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_condition</a>(request) -> Seed::Types::CompletionFullResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_condition_stream(
  query: "query",
  stream: false
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**query:** `String` — The prompt or query to complete.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_shared_schema_stream</a>(request) -> Seed::Types::CompletionStreamChunk</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_shared_schema_stream(
  prompt: "prompt",
  model: "model",
  stream: true
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**prompt:** `String` — The prompt to complete.
    
</dd>
</dl>

<dl>
<dd>

**model:** `String` — The model to use.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_shared_schema</a>(request) -> Seed::Types::CompletionFullResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_shared_schema_stream(
  prompt: "prompt",
  model: "model",
  stream: false
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**prompt:** `String` — The prompt to complete.
    
</dd>
</dl>

<dl>
<dd>

**model:** `String` — The model to use.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">validate_completion</a>(request) -> Seed::Types::CompletionFullResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A non-streaming endpoint that references the same SharedCompletionRequest schema as endpoint 10. Ensures the shared $ref schema remains available and is not excluded during the streaming endpoint's processing.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.validate_completion(
  prompt: "prompt",
  model: "model"
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**prompt:** `String` — The prompt to complete.
    
</dd>
</dl>

<dl>
<dd>

**model:** `String` — The model to use.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_union_stream</a>(request) -> Seed::Types::CompletionStreamChunk</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_union_stream
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamXFernStreamingUnionStreamRequest` — A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_union</a>(request) -> Seed::Types::CompletionFullResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_union_stream
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamXFernStreamingUnionRequest` — A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">validate_union_request</a>(request) -> Seed::Types::ValidateUnionRequestResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

References UnionStreamRequestBase directly, ensuring the base schema cannot be excluded from the context. This endpoint exists to verify that shared base schemas used in discriminated union variants with stream-condition remain available.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.validate_union_request(prompt: "prompt")
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::UnionStreamRequestBase` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_nullable_condition_stream</a>(request) -> Seed::Types::CompletionStreamChunk</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_nullable_condition_stream(
  query: "query",
  stream: true
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**query:** `String` — The prompt or query to complete.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_nullable_condition</a>(request) -> Seed::Types::CompletionFullResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_nullable_condition_stream(
  query: "query",
  stream: false
)
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**query:** `String` — The prompt or query to complete.
    
</dd>
</dl>

<dl>
<dd>

**stream:** `Internal::Types::Boolean` — Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">stream_x_fern_streaming_sse_only</a>(request) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Uses x-fern-streaming with format: sse but no stream-condition. This represents a stream-only endpoint that always returns SSE. There is no non-streaming variant, and the response is always a stream of chunks.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.stream_x_fern_streaming_sse_only
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Seed::Types::StreamRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

