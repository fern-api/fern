use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NullableOptionalClient2 {
    pub http_client: HttpClient,
}

impl NullableOptionalClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Get a user by ID
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_user(
        &self,
        user_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<UserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/users/{}", user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Create a new user
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
    ) -> Result<UserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/users",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Update a user (partial update)
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn update_user(
        &self,
        user_id: &String,
        request: &UpdateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<UserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/api/users/{}", user_id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// List all users
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_users(
        &self,
        request: &ListUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .int("offset", request.offset.clone())
                    .bool("includeDeleted", request.include_deleted.clone())
                    .serialize("sortBy", request.sort_by.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Search users
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn search_users(
        &self,
        request: &SearchUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users/search",
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .string("department", request.department.clone())
                    .string("role", request.role.clone())
                    .serialize("isActive", request.is_active.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Create a complex profile to test nullable enums and unions
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_complex_profile(
        &self,
        request: &ComplexProfile,
        options: Option<RequestOptions>,
    ) -> Result<ComplexProfile, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/profiles/complex",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Get a complex profile by ID
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_complex_profile(
        &self,
        profile_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<ComplexProfile, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/profiles/complex/{}", profile_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Update complex profile to test nullable field updates
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn update_complex_profile(
        &self,
        profile_id: &String,
        request: &UpdateComplexProfileRequest,
        options: Option<RequestOptions>,
    ) -> Result<ComplexProfile, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/api/profiles/complex/{}", profile_id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Test endpoint for validating null deserialization
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn test_deserialization(
        &self,
        request: &DeserializationTestRequest,
        options: Option<RequestOptions>,
    ) -> Result<DeserializationTestResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/test/deserialization",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Filter users by role with nullable enum
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn filter_by_role(
        &self,
        request: &FilterByRoleQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users/filter",
                None,
                QueryBuilder::new()
                    .serialize("role", request.role.clone())
                    .serialize("status", request.status.clone())
                    .serialize("secondaryRole", request.secondary_role.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Get notification settings which may be null
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_notification_settings(
        &self,
        user_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<Option<NotificationMethod>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/users/{}/notifications", user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// Update tags to test array handling
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn update_tags(
        &self,
        user_id: &String,
        request: &UpdateTagsRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/api/users/{}/tags", user_id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Get search results with nullable unions
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_search_results(
        &self,
        request: &SearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<Option<Vec<SearchResult>>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/search",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
