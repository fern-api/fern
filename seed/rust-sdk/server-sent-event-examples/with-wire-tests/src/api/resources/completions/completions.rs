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

    pub async fn stream(
        &self,
        request: &StreamCompletionRequest,
        options: Option<RequestOptions>,
    ) -> Result<SseStream<StreamedCompletion>, ApiError> {
        self.http_client
            .execute_sse_request(
                Method::POST,
                "stream",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
                Some("[[DONE]]".to_string()),
            )
            .await
    }
}
