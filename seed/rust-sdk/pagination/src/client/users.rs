use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UsersClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl UsersClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
    }

    pub async fn list_with_cursor_pagination(&self, page: Option<&Option<i32>>, per_page: Option<&Option<i32>>, order: Option<&Option<Order>>, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = page {
                query_params.push(("page".to_string(), value.to_string()));
            }
            if let Some(value) = per_page {
                query_params.push(("per_page".to_string(), value.to_string()));
            }
            if let Some(value) = order {
                query_params.push(("order".to_string(), value.to_string()));
            }
            if let Some(value) = starting_after {
                query_params.push(("starting_after".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_mixed_type_cursor_pagination(&self, cursor: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersMixedTypePaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = cursor {
                query_params.push(("cursor".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_body_cursor_pagination(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn list_with_offset_pagination(&self, page: Option<&Option<i32>>, per_page: Option<&Option<i32>>, order: Option<&Option<Order>>, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = page {
                query_params.push(("page".to_string(), value.to_string()));
            }
            if let Some(value) = per_page {
                query_params.push(("per_page".to_string(), value.to_string()));
            }
            if let Some(value) = order {
                query_params.push(("order".to_string(), value.to_string()));
            }
            if let Some(value) = starting_after {
                query_params.push(("starting_after".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_double_offset_pagination(&self, page: Option<&Option<f64>>, per_page: Option<&Option<f64>>, order: Option<&Option<Order>>, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = page {
                query_params.push(("page".to_string(), value.to_string()));
            }
            if let Some(value) = per_page {
                query_params.push(("per_page".to_string(), value.to_string()));
            }
            if let Some(value) = order {
                query_params.push(("order".to_string(), value.to_string()));
            }
            if let Some(value) = starting_after {
                query_params.push(("starting_after".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_body_offset_pagination(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn list_with_offset_step_pagination(&self, page: Option<&Option<i32>>, limit: Option<&Option<i32>>, order: Option<&Option<Order>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = page {
                query_params.push(("page".to_string(), value.to_string()));
            }
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            if let Some(value) = order {
                query_params.push(("order".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_offset_pagination_has_next_page(&self, page: Option<&Option<i32>>, limit: Option<&Option<i32>>, order: Option<&Option<Order>>, options: Option<RequestOptions>) -> Result<ListUsersPaginationResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = page {
                query_params.push(("page".to_string(), value.to_string()));
            }
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            if let Some(value) = order {
                query_params.push(("order".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_extended_results(&self, cursor: Option<&Option<uuid::Uuid>>, options: Option<RequestOptions>) -> Result<ListUsersExtendedResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = cursor {
                query_params.push(("cursor".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_extended_results_and_optional_data(&self, cursor: Option<&Option<uuid::Uuid>>, options: Option<RequestOptions>) -> Result<ListUsersExtendedOptionalListResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = cursor {
                query_params.push(("cursor".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_usernames(&self, starting_after: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<UsernameCursor, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = starting_after {
                query_params.push(("starting_after".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_with_global_config(&self, offset: Option<&Option<i32>>, options: Option<RequestOptions>) -> Result<UsernameContainer, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = offset {
                query_params.push(("offset".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

