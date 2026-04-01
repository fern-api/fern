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

    pub async fn get(&self, id: &str, options: Option<RequestOptions>) -> Result<Shape, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/{}", id), None, None, options)
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
    pub async fn get_with_raw_response(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Shape>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/{}", id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn update(
        &self,
        request: &Shape,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "",
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
    pub async fn update_with_raw_response(
        &self,
        request: &Shape,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PATCH,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
