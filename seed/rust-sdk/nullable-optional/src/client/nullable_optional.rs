use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct NullableOptionalClient {
    pub http_client: HttpClient,
}

impl NullableOptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_user(&self, user_id: &String, options: Option<RequestOptions>) -> Result<UserResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/users/{}", user_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn create_user(&self, request: &CreateUserRequest, options: Option<RequestOptions>) -> Result<UserResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/api/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn update_user(&self, user_id: &String, request: &UpdateUserRequest, options: Option<RequestOptions>) -> Result<UserResponse, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            &format!("/api/users/{}", user_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn list_users(&self, limit: Option<Option<i32>>, offset: Option<Option<i32>>, include_deleted: Option<Option<bool>>, sort_by: Option<Option<Option<String>>>, options: Option<RequestOptions>) -> Result<Vec<UserResponse>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = limit {
                query_params.push(("limit".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = offset {
                query_params.push(("offset".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = include_deleted {
                query_params.push(("includeDeleted".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = sort_by {
                query_params.push(("sortBy".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn search_users(&self, query: Option<String>, department: Option<Option<String>>, role: Option<Option<String>>, is_active: Option<Option<Option<bool>>>, options: Option<RequestOptions>) -> Result<Vec<UserResponse>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/users/search",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = query {
                query_params.push(("query".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = department {
                query_params.push(("department".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = role {
                query_params.push(("role".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = is_active {
                query_params.push(("isActive".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

