use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;
use std::collections::HashMap;

pub struct BigunionClient {
    pub http_client: HttpClient,
}

impl BigunionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<BigUnion, ApiError> {
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
    ) -> Result<WithRawResponse<BigUnion>, ApiError> {
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
        request: &BigUnion,
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
        request: &BigUnion,
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

    pub async fn update_many(
        &self,
        request: &Vec<BigUnion>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, bool>, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "/many",
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
    pub async fn update_many_with_raw_response(
        &self,
        request: &Vec<BigUnion>,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<HashMap<String, bool>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PATCH,
                "/many",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
