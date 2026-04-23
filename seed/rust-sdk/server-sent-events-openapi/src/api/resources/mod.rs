//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string literal, number literal, and object data payloads.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_protocol_no_collision(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamProtocolNoCollisionResponse>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/protocol-no-collision",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level discriminant from the data-level field when context=protocol is specified.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_protocol_collision(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamProtocolCollisionResponse>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/protocol-collision",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by customers with context=data.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_data_context(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamDataContextResponse>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/data-context",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_no_context(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamNoContextResponse>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/no-context",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to flatten the event field alongside payload fields instead of wrapping them in a data field.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_protocol_with_flat_schema(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamProtocolWithFlatSchemaResponse>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/protocol-with-flat-schema",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// Mismatched combination: context=data with the envelope+data schema pattern that is normally used with context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the event field and data field into an envelope structure.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_data_context_with_envelope_schema(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamDataContextWithEnvelopeSchemaResponse>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/data-context-with-envelope-schema",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution relies on const matching.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_oas_spec_native(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<Event>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/oas-spec-native",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Complete JSON response (fetched at once, not streaming)
    pub async fn stream_x_fern_streaming_condition_stream(
        &self,
        request: &StreamXFernStreamingConditionStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionStreamChunk, ApiError> {
        self.http_client
            .execute_request::<CompletionStreamChunk>(
                Method::POST,
                "stream/x-fern-streaming-condition",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming extension with stream-condition to split into streaming and non-streaming variants based on a request body field. The request body is a $ref to a named schema. The response and response-stream point to different schemas.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn stream_x_fern_streaming_condition(
        &self,
        request: &StreamXFernStreamingConditionRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionFullResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "stream/x-fern-streaming-condition",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Complete JSON response (fetched at once, not streaming)
    pub async fn stream_x_fern_streaming_shared_schema_stream(
        &self,
        request: &StreamXFernStreamingSharedSchemaStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionStreamChunk, ApiError> {
        self.http_client
            .execute_request::<CompletionStreamChunk>(
                Method::POST,
                "stream/x-fern-streaming-shared-schema",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with stream-condition. The request body $ref (SharedCompletionRequest) is also referenced by a separate non-streaming endpoint (/validate-completion). This tests that the shared request schema is not excluded from the context during streaming processing.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn stream_x_fern_streaming_shared_schema(
        &self,
        request: &StreamXFernStreamingSharedSchemaRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionFullResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "stream/x-fern-streaming-shared-schema",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// A non-streaming endpoint that references the same SharedCompletionRequest schema as endpoint 10. Ensures the shared $ref schema remains available and is not excluded during the streaming endpoint's processing.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn validate_completion(
        &self,
        request: &SharedCompletionRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionFullResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "validate-completion",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    ///
    /// # Arguments
    ///
    /// * `request` - A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Complete JSON response (fetched at once, not streaming)
    pub async fn stream_x_fern_streaming_union_stream(
        &self,
        request: &StreamXFernStreamingUnionStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionStreamChunk, ApiError> {
        self.http_client
            .execute_request::<CompletionStreamChunk>(
                Method::POST,
                "stream/x-fern-streaming-union",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with stream-condition where the request body is a discriminated union (oneOf) whose variants inherit the stream condition field (stream_response) from a shared base schema via allOf. Tests that the stream condition property is not duplicated in the generated output when the base schema is expanded into each variant.
    ///
    /// # Arguments
    ///
    /// * `request` - A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn stream_x_fern_streaming_union(
        &self,
        request: &StreamXFernStreamingUnionRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionFullResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "stream/x-fern-streaming-union",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// References UnionStreamRequestBase directly, ensuring the base schema cannot be excluded from the context. This endpoint exists to verify that shared base schemas used in discriminated union variants with stream-condition remain available.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn validate_union_request(
        &self,
        request: &UnionStreamRequestBase,
        options: Option<RequestOptions>,
    ) -> Result<ValidateUnionRequestResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "validate-union-request",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Complete JSON response (fetched at once, not streaming)
    pub async fn stream_x_fern_streaming_nullable_condition_stream(
        &self,
        request: &StreamXFernStreamingNullableConditionStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionStreamChunk, ApiError> {
        self.http_client
            .execute_request::<CompletionStreamChunk>(
                Method::POST,
                "stream/x-fern-streaming-nullable-condition",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with stream-condition where the stream field is nullable (type: ["boolean", "null"] in OAS 3.1). Previously, the spread order in the importer caused the nullable type array to overwrite the const literal, producing stream?: true | null instead of stream: true. The const/type override must be spread after the original property.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn stream_x_fern_streaming_nullable_condition(
        &self,
        request: &StreamXFernStreamingNullableConditionRequest,
        options: Option<RequestOptions>,
    ) -> Result<CompletionFullResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "stream/x-fern-streaming-nullable-condition",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Uses x-fern-streaming with format: sse but no stream-condition. This represents a stream-only endpoint that always returns SSE. There is no non-streaming variant, and the response is always a stream of chunks.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Server-Sent Events stream (use futures::StreamExt to iterate)
    pub async fn stream_x_fern_streaming_sse_only(
        &self,
        request: &StreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<String>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream/x-fern-streaming-sse-only",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }
}
