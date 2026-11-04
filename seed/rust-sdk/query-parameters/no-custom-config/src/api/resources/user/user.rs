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
    /// use seed_query_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = QueryParametersClient::new(config).expect("Failed to build client");
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
                    .build(),
                options,
            )
            .await
    }
}
