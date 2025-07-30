use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_with_cursor_pagination(&self, page: Option<&Option<i32>>, per_page: Option<&Option<i32>>, order: Option<&Option<Order>>, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_mixed_type_cursor_pagination(&self, cursor: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersMixedTypePaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_body_cursor_pagination(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn list_with_offset_pagination(&self, page: Option<&Option<i32>>, per_page: Option<&Option<i32>>, order: Option<&Option<Order>>, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_double_offset_pagination(&self, page: Option<&Option<f64>>, per_page: Option<&Option<f64>>, order: Option<&Option<Order>>, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_body_offset_pagination(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn list_with_offset_step_pagination(&self, page: Option<&Option<i32>>, limit: Option<&Option<i32>>, order: Option<&Option<Order>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_offset_pagination_has_next_page(&self, page: Option<&Option<i32>>, limit: Option<&Option<i32>>, order: Option<&Option<Order>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_extended_results(&self, cursor: Option<&Option<uuid::Uuid>>, options: Option<RequestOptions>) -> Result<ListUsersExtendedResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_extended_results_and_optional_data(&self, cursor: Option<&Option<uuid::Uuid>>, options: Option<RequestOptions>) -> Result<ListUsersExtendedOptionalListResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_usernames(&self, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<UsernameCursor, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

    pub async fn list_with_global_config(&self, offset: Option<&Option<i32>>, options: Option<RequestOptions>) -> Result<UsernameContainer, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            options,
        ).await
    }

}

