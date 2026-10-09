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
    /// use seed_server_sent_events_resumable::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ServerSentEventsResumableClient::new(config).expect("Failed to build client");
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
    /// use seed_server_sent_events_resumable::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ServerSentEventsResumableClient::new(config).expect("Failed to build client");
    ///     client
    ///         .completions
    ///         .stream_non_resumable(
    ///             &StreamCompletionRequestNonResumable {
    ///                 query: "bar".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn stream_non_resumable(
        &self,
        request: &StreamCompletionRequestNonResumable,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamedCompletion>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream-non-resumable",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
                Some("[[DONE]]".to_string()),
            )
            .await
    }
}
