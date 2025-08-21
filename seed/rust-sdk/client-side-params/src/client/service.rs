use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_resources(&self, page: Option<i32>, per_page: Option<i32>, sort: Option<String>, order: Option<String>, include_totals: Option<bool>, fields: Option<Option<String>>, search: Option<Option<String>>, options: Option<RequestOptions>) -> Result<Vec<Resource>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/resources",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = page {
                query_params.push(("page".to_string(), value.to_string()));
            }
            if let Some(value) = per_page {
                query_params.push(("per_page".to_string(), value.to_string()));
            }
            if let Some(value) = sort {
                query_params.push(("sort".to_string(), value.to_string()));
            }
            if let Some(value) = order {
                query_params.push(("order".to_string(), value.to_string()));
            }
            if let Some(value) = include_totals {
                query_params.push(("include_totals".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = search {
                query_params.push(("search".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_resource(&self, resource_id: &String, include_metadata: Option<bool>, format: Option<String>, options: Option<RequestOptions>) -> Result<Resource, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/resources/{}", resource_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = include_metadata {
                query_params.push(("include_metadata".to_string(), value.to_string()));
            }
            if let Some(value) = format {
                query_params.push(("format".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn search_resources(&self, limit: Option<i32>, offset: Option<i32>, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<SearchResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/api/resources/search",
            Some(serde_json::to_value(request).unwrap_or_default()),
            {
            let mut query_params = Vec::new();
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            if let Some(value) = offset {
                query_params.push(("offset".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_users(&self, page: Option<Option<i32>>, per_page: Option<Option<i32>>, include_totals: Option<Option<bool>>, sort: Option<Option<String>>, connection: Option<Option<String>>, q: Option<Option<String>>, search_engine: Option<Option<String>>, fields: Option<Option<String>>, options: Option<RequestOptions>) -> Result<PaginatedUserResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = page {
                query_params.push(("page".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = per_page {
                query_params.push(("per_page".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = include_totals {
                query_params.push(("include_totals".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = sort {
                query_params.push(("sort".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = connection {
                query_params.push(("connection".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = q {
                query_params.push(("q".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = search_engine {
                query_params.push(("search_engine".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_user_by_id(&self, user_id: &String, fields: Option<Option<String>>, include_fields: Option<Option<bool>>, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/users/{}", user_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = include_fields {
                query_params.push(("include_fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn create_user(&self, request: &CreateUserRequest, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/api/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn update_user(&self, user_id: &String, request: &UpdateUserRequest, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            &format!("/api/users/{}", user_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn delete_user(&self, user_id: &String, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/api/users/{}", user_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn list_connections(&self, strategy: Option<Option<String>>, name: Option<Option<String>>, fields: Option<Option<String>>, options: Option<RequestOptions>) -> Result<Vec<Connection>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/connections",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = strategy {
                query_params.push(("strategy".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = name {
                query_params.push(("name".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_connection(&self, connection_id: &String, fields: Option<Option<String>>, options: Option<RequestOptions>) -> Result<Connection, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/connections/{}", connection_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_clients(&self, fields: Option<Option<String>>, include_fields: Option<Option<bool>>, page: Option<Option<i32>>, per_page: Option<Option<i32>>, include_totals: Option<Option<bool>>, is_global: Option<Option<bool>>, is_first_party: Option<Option<bool>>, app_type: Option<Option<Vec<String>>>, options: Option<RequestOptions>) -> Result<PaginatedClientResponse, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/clients",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = include_fields {
                query_params.push(("include_fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = page {
                query_params.push(("page".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = per_page {
                query_params.push(("per_page".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = include_totals {
                query_params.push(("include_totals".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = is_global {
                query_params.push(("is_global".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = is_first_party {
                query_params.push(("is_first_party".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = app_type {
                query_params.push(("app_type".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_client(&self, client_id: &String, fields: Option<Option<String>>, include_fields: Option<Option<bool>>, options: Option<RequestOptions>) -> Result<Client, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/clients/{}", client_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = fields {
                query_params.push(("fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = include_fields {
                query_params.push(("include_fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

