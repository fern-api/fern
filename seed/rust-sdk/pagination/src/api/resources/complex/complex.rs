use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct ComplexClient {
    pub http_client: HttpClient,
}

impl ComplexClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn search(
        &self,
        index: &str,
        request: &SearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedConversationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("{}/conversations/search", index),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn search_with_raw_response(
        &self,
        index: &str,
        request: &SearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<PaginatedConversationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                &format!("{}/conversations/search", index),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
