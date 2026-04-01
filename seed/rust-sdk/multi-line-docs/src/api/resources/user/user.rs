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

    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The ID of the user to retrieve.
    /// This ID is unique to each user.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    pub async fn get_user(
        &self,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("users/{}", user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `user_id` - The ID of the user to retrieve.
    /// This ID is unique to each user.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_user_with_raw_response(
        &self,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("users/{}", user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Create a new user.
    /// This endpoint is used to create a new user.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_user(
        &self,
        request: &CreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Create a new user.
    /// This endpoint is used to create a new user.
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn create_user_with_raw_response(
        &self,
        request: &CreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<User>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
