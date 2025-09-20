use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NullableOptionalClient {
    pub http_client: HttpClient,
}

impl NullableOptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

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

    pub async fn list_users(
        &self,
        limit: Option<i32>,
        offset: Option<i32>,
        include_deleted: Option<bool>,
        sort_by: Option<Option<String>>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users",
                None,
                QueryBuilder::new()
                    .int("limit", limit)
                    .int("offset", offset)
                    .bool("includeDeleted", include_deleted)
                    .serialize("sortBy", sort_by)
                    .build(),
                options,
            )
            .await
    }

    pub async fn search_users(
        &self,
        query: Option<String>,
        department: Option<String>,
        role: Option<String>,
        is_active: Option<Option<bool>>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users/search",
                None,
                QueryBuilder::new()
                    .structured_query("query", query)
                    .string("department", department)
                    .string("role", role)
                    .serialize("isActive", is_active)
                    .build(),
                options,
            )
            .await
    }

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

    pub async fn update_complex_profile(
        &self,
        profile_id: &String,
        request: &serde_json::Value,
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

    pub async fn filter_by_role(
        &self,
        role: Option<UserRole>,
        status: Option<UserStatus>,
        secondary_role: Option<Option<UserRole>>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserResponse>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users/filter",
                None,
                QueryBuilder::new()
                    .serialize("role", role)
                    .serialize("status", status)
                    .serialize("secondaryRole", secondary_role)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_notification_settings(
        &self,
        user_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<Option<NotificationMethod>, ApiError> {
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

    pub async fn update_tags(
        &self,
        user_id: &String,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/api/users/{}", user_id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_search_results(
        &self,
        request: &serde_json::Value,
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
