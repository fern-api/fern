use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .get_user(&"tenant_id".to_string(), &"user_id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_user(
        &self,
        tenant_id: &str,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/{}/user/{}", tenant_id, user_id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .create_user(
    ///             &"tenant_id".to_string(),
    ///             &User {
    ///                 name: "name".to_string(),
    ///                 tags: vec!["tags".to_string(), "tags".to_string()],
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_user(
        &self,
        tenant_id: &str,
        request: &User,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/{}/user/", tenant_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .update_user(
    ///             &"tenant_id".to_string(),
    ///             &"user_id".to_string(),
    ///             &User {
    ///                 name: "name".to_string(),
    ///                 tags: vec!["tags".to_string(), "tags".to_string()],
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_user(
        &self,
        tenant_id: &str,
        user_id: &str,
        request: &User,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/{}/user/{}", tenant_id, user_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .search_users(
    ///             &"tenant_id".to_string(),
    ///             &"user_id".to_string(),
    ///             &SearchUsersQueryRequest {
    ///                 limit: Some(1),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn search_users(
        &self,
        tenant_id: &str,
        user_id: &str,
        request: &SearchUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/{}/user/{}/search", tenant_id, user_id),
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Test endpoint with path parameter that has a text prefix (v{version})
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .get_user_metadata(&"tenant_id".to_string(), &"user_id".to_string(), 1, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_user_metadata(
        &self,
        tenant_id: &str,
        user_id: &str,
        version: i64,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/{}/user/{}/metadata/v{}", tenant_id, user_id, version),
                None,
                None,
                options,
            )
            .await
    }

    /// Test endpoint with path parameters listed in different order than found in path
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .get_user_specifics(
    ///             &"tenant_id".to_string(),
    ///             &"user_id".to_string(),
    ///             1,
    ///             &"thought".to_string(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_user_specifics(
        &self,
        tenant_id: &str,
        user_id: &str,
        version: i64,
        thought: &str,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "/{}/user/{}/specifics/{}/{}",
                    tenant_id, user_id, version, thought
                ),
                None,
                None,
                options,
            )
            .await
    }
}
