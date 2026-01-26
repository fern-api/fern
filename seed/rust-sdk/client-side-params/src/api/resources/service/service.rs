use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    /// List resources with pagination
    ///
    /// # Arguments
    ///
    /// * `page` - Zero-indexed page number
    /// * `per_page` - Number of items per page
    /// * `sort` - Sort field
    /// * `order` - Sort order (asc or desc)
    /// * `include_totals` - Whether to include total count
    /// * `fields` - Comma-separated list of fields to include
    /// * `search` - Search query
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_resources(&self, request: &ListResourcesQueryRequest, options: Option<RequestOptions>) -> Result<Vec<Resource>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/resources",
            None,
            QueryBuilder::new().int("page", request.page.clone()).int("per_page", request.per_page.clone()).string("sort", request.sort.clone()).string("order", request.order.clone()).bool("include_totals", request.include_totals.clone()).string("fields", request.fields.clone()).string("search", request.search.clone())
            .build(),
            options,
        ).await
    }

    /// Get a single resource
    ///
    /// # Arguments
    ///
    /// * `include_metadata` - Include metadata in response
    /// * `format` - Response format
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_resource(&self, resource_id: &String, request: &GetResourceQueryRequest, options: Option<RequestOptions>) -> Result<Resource, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/resources/{}", resource_id),
            None,
            QueryBuilder::new().bool("include_metadata", request.include_metadata.clone()).string("format", request.format.clone())
            .build(),
            options,
        ).await
    }

    /// Search resources with complex parameters
    ///
    /// # Arguments
    ///
    /// * `limit` - Maximum results to return
    /// * `offset` - Offset for pagination
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn search_resources(&self, request: &SearchResourcesRequest, options: Option<RequestOptions>) -> Result<SearchResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/api/resources/search",
            Some(serde_json::to_value(request).unwrap_or_default()),
            QueryBuilder::new().int("limit", request.limit.clone()).int("offset", request.offset.clone())
            .build(),
            options,
        ).await
    }

    /// List or search for users
    ///
    /// # Arguments
    ///
    /// * `page` - Page index of the results to return. First page is 0.
    /// * `per_page` - Number of results per page.
    /// * `include_totals` - Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    /// * `sort` - Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    /// * `connection` - Connection filter
    /// * `q` - Query string following Lucene query string syntax
    /// * `search_engine` - Search engine version (v1, v2, or v3)
    /// * `fields` - Comma-separated list of fields to include or exclude
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_users(&self, request: &ListUsersQueryRequest, options: Option<RequestOptions>) -> Result<PaginatedUserResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/users",
            None,
            QueryBuilder::new().int("page", request.page.clone()).int("per_page", request.per_page.clone()).bool("include_totals", request.include_totals.clone()).string("sort", request.sort.clone()).string("connection", request.connection.clone()).string("q", request.q.clone()).string("search_engine", request.search_engine.clone()).string("fields", request.fields.clone())
            .build(),
            options,
        ).await
    }

    /// Get a user by ID
    ///
    /// # Arguments
    ///
    /// * `fields` - Comma-separated list of fields to include or exclude
    /// * `include_fields` - true to include the fields specified, false to exclude them
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_user_by_id(&self, user_id: &String, request: &GetUserByIdQueryRequest, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/users/{}", user_id),
            None,
            QueryBuilder::new().string("fields", request.fields.clone()).bool("include_fields", request.include_fields.clone())
            .build(),
            options,
        ).await
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
    pub async fn create_user(&self, request: &CreateUserRequest, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/api/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    /// Update a user
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn update_user(&self, user_id: &String, request: &UpdateUserRequest, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::PATCH,
            &format!("/api/users/{}", user_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    /// Delete a user
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    pub async fn delete_user(&self, user_id: &String, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/api/users/{}", user_id),
            None,
            None,
            options,
        ).await
    }

    /// List all connections
    ///
    /// # Arguments
    ///
    /// * `strategy` - Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    /// * `name` - Filter by connection name
    /// * `fields` - Comma-separated list of fields to include
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_connections(&self, request: &ListConnectionsQueryRequest, options: Option<RequestOptions>) -> Result<Vec<Connection>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/connections",
            None,
            QueryBuilder::new().string("strategy", request.strategy.clone()).string("name", request.name.clone()).string("fields", request.fields.clone())
            .build(),
            options,
        ).await
    }

    /// Get a connection by ID
    ///
    /// # Arguments
    ///
    /// * `fields` - Comma-separated list of fields to include
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_connection(&self, connection_id: &String, request: &GetConnectionQueryRequest, options: Option<RequestOptions>) -> Result<Connection, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/connections/{}", connection_id),
            None,
            QueryBuilder::new().string("fields", request.fields.clone())
            .build(),
            options,
        ).await
    }

    /// List all clients/applications
    ///
    /// # Arguments
    ///
    /// * `fields` - Comma-separated list of fields to include
    /// * `include_fields` - Whether specified fields are included or excluded
    /// * `page` - Page number (zero-based)
    /// * `per_page` - Number of results per page
    /// * `include_totals` - Include total count in response
    /// * `is_global` - Filter by global clients
    /// * `is_first_party` - Filter by first party clients
    /// * `app_type` - Filter by application type (spa, native, regular_web, non_interactive)
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_clients(&self, request: &ListClientsQueryRequest, options: Option<RequestOptions>) -> Result<PaginatedClientResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/api/clients",
            None,
            QueryBuilder::new().string("fields", request.fields.clone()).bool("include_fields", request.include_fields.clone()).int("page", request.page.clone()).int("per_page", request.per_page.clone()).bool("include_totals", request.include_totals.clone()).bool("is_global", request.is_global.clone()).bool("is_first_party", request.is_first_party.clone()).serialize("app_type", request.app_type.clone())
            .build(),
            options,
        ).await
    }

    /// Get a client by ID
    ///
    /// # Arguments
    ///
    /// * `fields` - Comma-separated list of fields to include
    /// * `include_fields` - Whether specified fields are included or excluded
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_client(&self, client_id: &String, request: &GetClientQueryRequest, options: Option<RequestOptions>) -> Result<Client, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/api/clients/{}", client_id),
            None,
            QueryBuilder::new().string("fields", request.fields.clone()).bool("include_fields", request.include_fields.clone())
            .build(),
            options,
        ).await
    }

}

