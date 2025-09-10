use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_resources(&self, page: Option<i32>, per_page: Option<i32>, sort: Option<String>, order: Option<String>, include_totals: Option<bool>, fields: Option<String>, search: Option<String>, options: Option<RequestOptions>) -> Result<Vec<Resource>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/resources",
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = page {
                query_builder.add_simple("page", &value.to_string());
            }
            if let Some(value) = per_page {
                query_builder.add_simple("per_page", &value.to_string());
            }
            if let Some(value) = sort {
                query_builder.add_simple("sort", &value);
            }
            if let Some(value) = order {
                query_builder.add_simple("order", &value);
            }
            if let Some(value) = include_totals {
                query_builder.add_simple("include_totals", &value.to_string());
            }
            if let Some(value) = fields {
                query_builder.add_simple("fields", &value);
            }
            if let Some(value) = search {
                query_builder.add_simple("search", &value);
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

    pub async fn get_resource(&self, resource_id: &String, include_metadata: Option<bool>, format: Option<String>, options: Option<RequestOptions>) -> Result<Resource, ApiError> {
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
                query_params.push(("format".to_string(), value.clone()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn search_resources(&self, limit: Option<i32>, offset: Option<i32>, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<SearchResponse, ApiError> {
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

    pub async fn list_users(&self, page: Option<i32>, per_page: Option<i32>, include_totals: Option<bool>, sort: Option<String>, connection: Option<String>, q: Option<String>, search_engine: Option<String>, fields: Option<String>, options: Option<RequestOptions>) -> Result<PaginatedUserResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/users",
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = page {
                query_builder.add_simple("page", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = per_page {
                query_builder.add_simple("per_page", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = include_totals {
                query_builder.add_simple("include_totals", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = sort {
                query_builder.add_simple("sort", &value);
            }
            if let Some(value) = connection {
                query_builder.add_simple("connection", &value);
            }
            if let Some(value) = q {
                query_builder.add_simple("q", &value);
            }
            if let Some(value) = search_engine {
                query_builder.add_simple("search_engine", &value);
            }
            if let Some(value) = fields {
                query_builder.add_simple("fields", &value);
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

    pub async fn get_user_by_id(&self, user_id: &String, fields: Option<String>, include_fields: Option<bool>, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/users/{}", user_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = fields {
                query_params.push(("fields".to_string(), value.clone()));
            }
            if let Some(value) = include_fields {
                query_params.push(("include_fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn create_user(&self, request: &CreateUserRequest, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/api/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn update_user(&self, user_id: &String, request: &UpdateUserRequest, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::PATCH,
            &format!("/api/users/{}", user_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn delete_user(&self, user_id: &String, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/api/users/{}", user_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn list_connections(&self, strategy: Option<String>, name: Option<String>, fields: Option<String>, options: Option<RequestOptions>) -> Result<Vec<Connection>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/connections",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = strategy {
                query_params.push(("strategy".to_string(), value.clone()));
            }
            if let Some(value) = name {
                query_params.push(("name".to_string(), value.clone()));
            }
            if let Some(value) = fields {
                query_params.push(("fields".to_string(), value.clone()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_connection(&self, connection_id: &String, fields: Option<String>, options: Option<RequestOptions>) -> Result<Connection, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/connections/{}", connection_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = fields {
                query_params.push(("fields".to_string(), value.clone()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn list_clients(&self, fields: Option<String>, include_fields: Option<bool>, page: Option<i32>, per_page: Option<i32>, include_totals: Option<bool>, is_global: Option<bool>, is_first_party: Option<bool>, app_type: Option<Vec<String>>, options: Option<RequestOptions>) -> Result<PaginatedClientResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/clients",
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = fields {
                query_builder.add_simple("fields", &value);
            }
            if let Some(value) = include_fields {
                query_builder.add_simple("include_fields", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = page {
                query_builder.add_simple("page", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = per_page {
                query_builder.add_simple("per_page", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = include_totals {
                query_builder.add_simple("include_totals", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = is_global {
                query_builder.add_simple("is_global", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = is_first_party {
                query_builder.add_simple("is_first_party", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = app_type {
                query_builder.add_simple("app_type", &serde_json::to_string(&value).unwrap_or_default());
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

    pub async fn get_client(&self, client_id: &String, fields: Option<String>, include_fields: Option<bool>, options: Option<RequestOptions>) -> Result<Client, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/clients/{}", client_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = fields {
                query_params.push(("fields".to_string(), value.clone()));
            }
            if let Some(value) = include_fields {
                query_params.push(("include_fields".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

