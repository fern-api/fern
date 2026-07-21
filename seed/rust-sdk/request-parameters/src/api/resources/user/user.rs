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
    /// use seed_request_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RequestParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .create_username(
    ///             &CreateUsernameRequest {
    ///                 tags: vec!["tags".to_string(), "tags".to_string()],
    ///                 username: "username".to_string(),
    ///                 password: "password".to_string(),
    ///                 name: "test".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_username(
        &self,
        request: &CreateUsernameRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/user/username",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("tags", Some(request.tags.clone()))
                    .build(),
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_request_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RequestParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .create_username_with_referenced_type(
    ///             &CreateUsernameWithReferencedTypeRequest {
    ///                 tags: vec!["tags".to_string(), "tags".to_string()],
    ///                 body: CreateUsernameBody {
    ///                     username: "username".to_string(),
    ///                     password: "password".to_string(),
    ///                     name: "test".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_username_with_referenced_type(
        &self,
        request: &CreateUsernameWithReferencedTypeRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/user/username-referenced",
                Some(serde_json::to_value(&request.body).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("tags", Some(request.tags.clone()))
                    .build(),
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_request_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RequestParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .create_username_optional(
    ///             &Some(CreateUsernameBodyOptionalProperties {
    ///                 ..Default::default()
    ///             }),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_username_optional(
        &self,
        request: &Option<CreateUsernameBodyOptionalProperties>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/user/username-optional",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_request_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = RequestParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .get_username(
    ///             &GetUsernameQueryRequest {
    ///                 limit: 1,
    ///                 id: Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                 date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
    ///                 deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 bytes: base64::engine::general_purpose::STANDARD
    ///                     .decode("SGVsbG8gd29ybGQh")
    ///                     .unwrap(),
    ///                 user: User {
    ///                     name: "name".to_string(),
    ///                     tags: vec!["tags".to_string(), "tags".to_string()],
    ///                     ..Default::default()
    ///                 },
    ///                 user_list: vec![
    ///                     User {
    ///                         name: "name".to_string(),
    ///                         tags: vec!["tags".to_string(), "tags".to_string()],
    ///                         ..Default::default()
    ///                     },
    ///                     User {
    ///                         name: "name".to_string(),
    ///                         tags: vec!["tags".to_string(), "tags".to_string()],
    ///                         ..Default::default()
    ///                     },
    ///                 ],
    ///                 optional_deadline: Some(
    ///                     DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 ),
    ///                 key_value: HashMap::from([("keyValue".to_string(), "keyValue".to_string())]),
    ///                 optional_string: Some("optionalString".to_string()),
    ///                 nested_user: NestedUser {
    ///                     name: "name".to_string(),
    ///                     user: User {
    ///                         name: "name".to_string(),
    ///                         tags: vec!["tags".to_string(), "tags".to_string()],
    ///                         ..Default::default()
    ///                     },
    ///                     ..Default::default()
    ///                 },
    ///                 optional_user: Some(User {
    ///                     name: "name".to_string(),
    ///                     tags: vec!["tags".to_string(), "tags".to_string()],
    ///                     ..Default::default()
    ///                 }),
    ///                 exclude_user: vec![User {
    ///                     name: "name".to_string(),
    ///                     tags: vec!["tags".to_string(), "tags".to_string()],
    ///                     ..Default::default()
    ///                 }],
    ///                 filter: vec!["filter".to_string()],
    ///                 long_param: 1000000,
    ///                 big_int_param: BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_username(
        &self,
        request: &GetUsernameQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/user",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .uuid("id", request.id.clone())
                    .date("date", request.date.clone())
                    .datetime("deadline", request.deadline.clone())
                    .serialize("bytes", Some(request.bytes.clone()))
                    .serialize("user", Some(request.user.clone()))
                    .serialize("userList", Some(request.user_list.clone()))
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", Some(request.key_value.clone()))
                    .string("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", Some(request.nested_user.clone()))
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize_array("excludeUser", request.exclude_user.clone())
                    .string_array("filter", request.filter.clone())
                    .int("longParam", request.long_param.clone())
                    .big_int("bigIntParam", request.big_int_param.clone())
                    .build(),
                options,
            )
            .await
    }
}
