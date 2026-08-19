use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, SseStream};
use reqwest::Method;

pub struct CompletionsClient {
    pub http_client: HttpClient,
}

impl CompletionsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_server_sent_events::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .completions
    ///         .stream(
    ///             &StreamCompletionRequest {
    ///                 query: "foo".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn stream(
        &self,
        request: &StreamCompletionRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamedCompletion>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                Some("[[DONE]]".to_string()),
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_server_sent_events::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .completions
    ///         .stream_events(
    ///             &StreamEventsRequest {
    ///                 query: "query".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn stream_events(
        &self,
        request: &StreamEventsRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamEvent>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream-events",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                Some("[DONE]".to_string()),
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_server_sent_events::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .completions
    ///         .stream_events_discriminant_in_data(
    ///             &StreamEventsDiscriminantInDataRequest {
    ///                 query: "query".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn stream_events_discriminant_in_data(
        &self,
        request: &StreamEventsDiscriminantInDataRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamEventDiscriminantInData>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream-events-discriminant-in-data",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                None,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_server_sent_events::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .completions
    ///         .stream_events_context_protocol(
    ///             &StreamEventsContextProtocolRequest {
    ///                 query: "query".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn stream_events_context_protocol(
        &self,
        request: &StreamEventsContextProtocolRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamEventContextProtocol>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream-events-context-protocol",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                Some("[DONE]".to_string()),
            )
            .await
    }
}
