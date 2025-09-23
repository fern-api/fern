use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn list_resources(
        &self,
        request: &ListResourcesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Resource>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/resources",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .string("sort", request.sort.clone())
                    .string("order", request.order.clone())
                    .bool("include_totals", request.include_totals.clone())
                    .string("fields", request.fields.clone())
                    .string("search", request.search.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_resource(
        &self,
        resource_id: &String,
        request: &GetResourceQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/resources/{}", resource_id),
                None,
                QueryBuilder::new()
                    .bool("include_metadata", request.include_metadata.clone())
                    .string("format", request.format.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn search_resources(
        &self,
        request: &SearchResourcesRequest,
        options: Option<RequestOptions>,
    ) -> Result<SearchResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/api/resources/search",
                Some(serde_json::to_value(request).unwrap_or_default()),
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .int("offset", request.offset.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_users(
        &self,
        request: &ListUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedUserResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .bool("include_totals", request.include_totals.clone())
                    .string("sort", request.sort.clone())
                    .string("connection", request.connection.clone())
                    .string("q", request.q.clone())
                    .string("search_engine", request.search_engine.clone())
                    .string("fields", request.fields.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_user_by_id(
        &self,
        user_id: &String,
        request: &GetUserByIdQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/users/{}", user_id),
                None,
                QueryBuilder::new()
                    .string("fields", request.fields.clone())
                    .bool("include_fields", request.include_fields.clone())
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
        request: &ListConnectionsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Connection>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/connections",
                None,
                QueryBuilder::new()
                    .string("strategy", request.strategy.clone())
                    .string("name", request.name.clone())
                    .string("fields", request.fields.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_connection(
        &self,
        connection_id: &String,
        request: &GetConnectionQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Connection, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/connections/{}", connection_id),
                None,
                QueryBuilder::new()
                    .string("fields", request.fields.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_clients(
        &self,
        request: &ListClientsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedClientResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/api/clients",
                None,
                QueryBuilder::new()
                    .string("fields", request.fields.clone())
                    .bool("include_fields", request.include_fields.clone())
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .bool("include_totals", request.include_totals.clone())
                    .bool("is_global", request.is_global.clone())
                    .bool("is_first_party", request.is_first_party.clone())
                    .serialize("app_type", request.app_type.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_client(
        &self,
        client_id: &String,
        request: &GetClientQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Client, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/api/clients/{}", client_id),
                None,
                QueryBuilder::new()
                    .string("fields", request.fields.clone())
                    .bool("include_fields", request.include_fields.clone())
                    .build(),
                options,
            )
            .await
    }
}
