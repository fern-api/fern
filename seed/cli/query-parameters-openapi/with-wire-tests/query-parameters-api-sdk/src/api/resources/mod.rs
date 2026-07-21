//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use query_parameters_api_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = QueryParametersApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .search(
    ///             &SearchQueryRequest {
    ///                 limit: 1,
    ///                 id: "id".to_string(),
    ///                 date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
    ///                 deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 bytes: "bytes".to_string(),
    ///                 user: User {
    ///                     name: Some("name".to_string()),
    ///                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                     ..Default::default()
    ///                 },
    ///                 user_list: vec![Some(User {
    ///                     name: Some("name".to_string()),
    ///                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                     ..Default::default()
    ///                 })],
    ///                 optional_deadline: Some(
    ///                     DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 ),
    ///                 key_value: Some(HashMap::from([(
    ///                     "keyValue".to_string(),
    ///                     "keyValue".to_string(),
    ///                 )])),
    ///                 optional_string: Some("optionalString".to_string()),
    ///                 nested_user: Some(NestedUser {
    ///                     name: Some("name".to_string()),
    ///                     user: Some(User {
    ///                         name: Some("name".to_string()),
    ///                         tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                         ..Default::default()
    ///                     }),
    ///                     ..Default::default()
    ///                 }),
    ///                 optional_user: Some(User {
    ///                     name: Some("name".to_string()),
    ///                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                     ..Default::default()
    ///                 }),
    ///                 exclude_user: vec![Some(User {
    ///                     name: Some("name".to_string()),
    ///                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                     ..Default::default()
    ///                 })],
    ///                 filter: vec![Some("filter".to_string())],
    ///                 tags: vec![Some("tags".to_string())],
    ///                 optional_tags: vec![Some("optionalTags".to_string())],
    ///                 neighbor: Some(SearchRequestNeighbor::User(User {
    ///                     name: Some("name".to_string()),
    ///                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                     ..Default::default()
    ///                 })),
    ///                 neighbor_required: SearchRequestNeighborRequired::User(User {
    ///                     name: Some("name".to_string()),
    ///                     tags: Some(vec!["tags".to_string(), "tags".to_string()]),
    ///                     ..Default::default()
    ///                 }),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn search(
        &self,
        request: &SearchQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<SearchResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "user/getUsername",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .string("id", request.id.clone())
                    .date("date", request.date.clone())
                    .datetime("deadline", request.deadline.clone())
                    .string("bytes", request.bytes.clone())
                    .serialize("user", Some(request.user.clone()))
                    .serialize_array("userList", request.user_list.clone())
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", request.key_value.clone())
                    .string("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", request.nested_user.clone())
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize_array("excludeUser", request.exclude_user.clone())
                    .string_array("filter", request.filter.clone())
                    .string_array("tags", request.tags.clone())
                    .string_array("optionalTags", request.optional_tags.clone())
                    .serialize("neighbor", request.neighbor.clone())
                    .serialize("neighborRequired", Some(request.neighbor_required.clone()))
                    .build(),
                options,
            )
            .await
    }
}
