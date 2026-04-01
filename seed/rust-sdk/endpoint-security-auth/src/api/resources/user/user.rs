use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_with_bearer(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_bearer_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_api_key(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_api_key_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_o_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_o_auth_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_basic(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_basic_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_inferred_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_inferred_auth_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_any_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_any_auth_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_with_all_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
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
    pub async fn get_with_all_auth_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "users", None, None, options)
            .await
    }
}
