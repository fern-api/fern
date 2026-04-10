use crate::api::*;
use crate::{ApiError, ByteStream, ClientConfig, HttpClient, RequestOptions};
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
        request: &CompletionsStreamRequest,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_stream_request(
                Method::POST,
                "stream",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn streamwithoutterminator(
        &self,
        request: &CompletionsStreamWithoutTerminatorRequest,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_stream_request(
                Method::POST,
                "stream-no-terminator",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
