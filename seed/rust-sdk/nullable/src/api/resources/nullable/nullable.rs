use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NullableClient2 {
    pub http_client: HttpClient,
}

impl NullableClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_nullable::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable
    ///         .get_users(
    ///             &GetUsersQueryRequest {
    ///                 usernames: vec![Some("usernames".to_string())],
    ///                 avatar: Some("avatar".to_string()),
    ///                 activated: vec![Some(true)],
    ///                 tags: vec![Some("tags".to_string())],
    ///                 extra: Some(true),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_users(
        &self,
        request: &GetUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .string_array("usernames", request.usernames.clone())
                    .string("avatar", request.avatar.clone())
                    .bool_array("activated", request.activated.clone())
                    .serialize_array("tags", request.tags.clone())
                    .serialize("extra", request.extra.clone())
                    .build(),
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_nullable::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable
    ///         .create_user(
    ///             &CreateUserRequest {
    ///                 username: "username".to_string(),
    ///                 tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                 metadata: Some(Metadata {
    ///                     created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                     updated_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                     avatar: Some("avatar".to_string()),
    ///                     activated: Some(true),
    ///                     status: Status::Active,
    ///                     values: Some(HashMap::from([(
    ///                         "values".to_string(),
    ///                         Some("values".to_string()),
    ///                     )])),
    ///                 }),
    ///                 avatar: Some("avatar".to_string()),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_user(
        &self,
        request: &CreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_nullable::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullableClient::new(config).expect("Failed to build client");
    ///     client
    ///         .nullable
    ///         .delete_user(
    ///             &DeleteUserRequest {
    ///                 username: Some("xy".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn delete_user(
        &self,
        request: &DeleteUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
