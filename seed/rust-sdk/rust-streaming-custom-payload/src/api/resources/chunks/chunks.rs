use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ChunksClient {
    pub http_client: HttpClient,
}

impl ChunksClient {
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
    ///     client.chunks.stream(None).await;
    /// }
    /// ```
    pub async fn stream(&self, options: Option<RequestOptions>) -> Result<Chunk, ApiError> {
        self.http_client
            .execute_request::<Chunk>(Method::GET, "chunks", None, None, options)
            .await
    }
}
