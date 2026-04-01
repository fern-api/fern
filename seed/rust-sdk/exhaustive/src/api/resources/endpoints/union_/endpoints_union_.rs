use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_and_return_union(
        &self,
        request: &Animal,
        options: Option<RequestOptions>,
    ) -> Result<Animal, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/union",
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
    pub async fn get_and_return_union_with_raw_response(
        &self,
        request: &Animal,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Animal>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/union",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
