use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct NullableClient2 {
    pub http_client: HttpClient,
}

impl NullableClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_users(
        &self,
        request: &GetUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .string_array("usernames", request.usernames.clone())
                    .string("avatar", request.avatar.clone())
                    .bool_array("activated", request.activated.clone())
                    .serialize_array("tags", request.tags.clone())
                    .serialize("extra", request.extra.clone())
                    .build(),
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
    pub async fn get_users_with_raw_response(
        &self,
        request: &GetUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .string_array("usernames", request.usernames.clone())
                    .string("avatar", request.avatar.clone())
                    .bool_array("activated", request.activated.clone())
                    .serialize_array("tags", request.tags.clone())
                    .serialize("extra", request.extra.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn create_user(
        &self,
        request: &CreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
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
    pub async fn create_user_with_raw_response(
        &self,
        request: &CreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<User>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn delete_user(
        &self,
        request: &DeleteUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                "/users",
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
    pub async fn delete_user_with_raw_response(
        &self,
        request: &DeleteUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<bool>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::DELETE,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
