use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct HttpMethodsClient {
    pub http_client: HttpClient,
}

impl HttpMethodsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn test_get(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/http-methods/{}", id),
                None,
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
    pub async fn test_get_with_raw_response(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/http-methods/{}", id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn test_post(
        &self,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/http-methods",
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
    pub async fn test_post_with_raw_response(
        &self,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ObjectWithOptionalField>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/http-methods",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn test_put(
        &self,
        id: &str,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/http-methods/{}", id),
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
    pub async fn test_put_with_raw_response(
        &self,
        id: &str,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ObjectWithOptionalField>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PUT,
                &format!("/http-methods/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn test_patch(
        &self,
        id: &str,
        request: &ObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/http-methods/{}", id),
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
    pub async fn test_patch_with_raw_response(
        &self,
        id: &str,
        request: &ObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ObjectWithOptionalField>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PATCH,
                &format!("/http-methods/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn test_delete(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/http-methods/{}", id),
                None,
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
    pub async fn test_delete_with_raw_response(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::DELETE,
                &format!("/http-methods/{}", id),
                None,
                None,
                options,
            )
            .await
    }
}
