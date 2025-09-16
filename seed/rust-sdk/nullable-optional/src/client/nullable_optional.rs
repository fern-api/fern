use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct NullableOptionalClient {
    pub http_client: HttpClient,
}

impl NullableOptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
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
                {
                    let mut query_builder = crate::QueryParameterBuilder::new();
                    if let Some(value) = limit {
                        query_builder.add_simple(
                            "limit",
                            &serde_json::to_string(&value).unwrap_or_default(),
                        );
                    }
                    if let Some(value) = offset {
                        query_builder.add_simple(
                            "offset",
                            &serde_json::to_string(&value).unwrap_or_default(),
                        );
                    }
                    if let Some(value) = include_deleted {
                        query_builder.add_simple(
                            "includeDeleted",
                            &serde_json::to_string(&value).unwrap_or_default(),
                        );
                    }
                    if let Some(value) = sort_by {
                        query_builder.add_simple("sortBy", &value);
                    }
                    let params = query_builder.build();
                    if params.is_empty() {
                        None
                    } else {
                        Some(params)
                    }
                },
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
                {
                    let mut query_builder = crate::QueryParameterBuilder::new();
                    if let Some(value) = query {
                        // Try to parse as structured query, fall back to simple if it fails
                        if let Err(_) = query_builder.add_structured_query(&value) {
                            query_builder.add_simple("query", &value);
                        }
                    }
                    if let Some(value) = department {
                        query_builder.add_simple("department", &value);
                    }
                    if let Some(value) = role {
                        query_builder.add_simple("role", &value);
                    }
                    if let Some(value) = is_active {
                        query_builder.add_simple(
                            "isActive",
                            &serde_json::to_string(&value).unwrap_or_default(),
                        );
                    }
                    let params = query_builder.build();
                    if params.is_empty() {
                        None
                    } else {
                        Some(params)
                    }
                },
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
                {
                    let mut query_params = Vec::new();
                    if let Some(value) = role {
                        query_params.push((
                            "role".to_string(),
                            serde_json::to_string(&value).unwrap_or_default(),
                        ));
                    }
                    if let Some(value) = status {
                        query_params.push((
                            "status".to_string(),
                            serde_json::to_string(&value).unwrap_or_default(),
                        ));
                    }
                    if let Some(value) = secondary_role {
                        query_params.push((
                            "secondaryRole".to_string(),
                            serde_json::to_string(&value).unwrap_or_default(),
                        ));
                    }
                    Some(query_params)
                },
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
