use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

    pub async fn list_resources(
        &self,
        page: Option<i32>,
        per_page: Option<i32>,
        sort: Option<String>,
        order: Option<String>,
        include_totals: Option<bool>,
        fields: Option<String>,
        search: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Resource>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/resources",
                None,
                QueryBuilder::new()
                    .int("page", page)
                    .int("per_page", per_page)
                    .string("sort", sort)
                    .string("order", order)
                    .bool("include_totals", include_totals)
                    .string("fields", fields)
                    .string("search", search)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_resource(
        &self,
        resource_id: &String,
        include_metadata: Option<bool>,
        format: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/resources/{}", resource_id),
                None,
                QueryBuilder::new()
                    .bool("include_metadata", include_metadata)
                    .string("format", format)
                    .build(),
                options,
            )
            .await
    }

    pub async fn search_resources(
        &self,
        limit: Option<i32>,
        offset: Option<i32>,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<SearchResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/resources/search",
                Some(serde_json::to_value(request).unwrap_or_default()),
                QueryBuilder::new()
                    .int("limit", limit)
                    .int("offset", offset)
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_users(
        &self,
        page: Option<i32>,
        per_page: Option<i32>,
        include_totals: Option<bool>,
        sort: Option<String>,
        connection: Option<String>,
        q: Option<String>,
        search_engine: Option<String>,
        fields: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedUserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users",
                None,
                QueryBuilder::new()
                    .int("page", page)
                    .int("per_page", per_page)
                    .bool("include_totals", include_totals)
                    .string("sort", sort)
                    .string("connection", connection)
                    .string("q", q)
                    .string("search_engine", search_engine)
                    .string("fields", fields)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_user_by_id(
        &self,
        user_id: &String,
        fields: Option<String>,
        include_fields: Option<bool>,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/users/{}", user_id),
                None,
                QueryBuilder::new()
                    .string("fields", fields)
                    .bool("include_fields", include_fields)
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
    ) -> Result<User, ApiError> {
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

    pub async fn delete_user(
        &self,
        user_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/api/users/{}", user_id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn list_connections(
        &self,
        strategy: Option<String>,
        name: Option<String>,
        fields: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Connection>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/connections",
                None,
                QueryBuilder::new()
                    .string("strategy", strategy)
                    .string("name", name)
                    .string("fields", fields)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_connection(
        &self,
        connection_id: &String,
        fields: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<Connection, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/connections/{}", connection_id),
                None,
                QueryBuilder::new().string("fields", fields).build(),
                options,
            )
            .await
    }

    pub async fn list_clients(
        &self,
        fields: Option<String>,
        include_fields: Option<bool>,
        page: Option<i32>,
        per_page: Option<i32>,
        include_totals: Option<bool>,
        is_global: Option<bool>,
        is_first_party: Option<bool>,
        app_type: Option<Vec<String>>,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedClientResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/clients",
                None,
                QueryBuilder::new()
                    .string("fields", fields)
                    .bool("include_fields", include_fields)
                    .int("page", page)
                    .int("per_page", per_page)
                    .bool("include_totals", include_totals)
                    .bool("is_global", is_global)
                    .bool("is_first_party", is_first_party)
                    .serialize("app_type", app_type)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_client(
        &self,
        client_id: &String,
        fields: Option<String>,
        include_fields: Option<bool>,
        options: Option<RequestOptions>,
    ) -> Result<Client, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/clients/{}", client_id),
                None,
                QueryBuilder::new()
                    .string("fields", fields)
                    .bool("include_fields", include_fields)
                    .build(),
                options,
            )
            .await
    }
}
