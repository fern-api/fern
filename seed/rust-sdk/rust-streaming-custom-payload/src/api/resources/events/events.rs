use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, SseStream};
use reqwest::Method;

pub struct EventsClient {
    pub http_client: HttpClient,
}

impl EventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_rust_streaming_custom_payload::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RustStreamingCustomPayloadClient::new(config).expect("Failed to build client");
    ///     client.events.stream(None).await;
    /// }
    /// ```
    pub async fn stream(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<Event>, ApiError> {
        self.http_client
            .execute_sse_request(Method::GET, "events", None, None, options, None)
            .await
    }
}
