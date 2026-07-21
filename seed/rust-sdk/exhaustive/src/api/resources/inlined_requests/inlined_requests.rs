use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct InlinedRequestsClient {
    pub http_client: HttpClient,
}

impl InlinedRequestsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// POST with custom object in request body, response is an object
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
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inlined_requests
    ///         .post_with_object_bodyand_response(
    ///             &PostWithObjectBody {
    ///                 string: "string".to_string(),
    ///                 integer: 1,
    ///                 nested_object: ObjectWithOptionalField {
    ///                     string: Some("string".to_string()),
    ///                     integer: Some(1),
    ///                     long: Some(1000000),
    ///                     double: Some(1.1),
    ///                     bool: Some(true),
    ///                     datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
    ///                     date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                     uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                     base64: Some(
    ///                         base64::engine::general_purpose::STANDARD
    ///                             .decode("SGVsbG8gd29ybGQh")
    ///                             .unwrap(),
    ///                     ),
    ///                     list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                     set: Some(HashSet::from(["set".to_string()])),
    ///                     map: Some(HashMap::from([(1, "map".to_string())])),
    ///                     bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn post_with_object_bodyand_response(
        &self,
        request: &PostWithObjectBody,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/req-bodies/object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// POST with root-level array body and header params
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
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inlined_requests
    ///         .post_with_array_body_and_headers(
    ///             &vec!["string".to_string(), "string".to_string()],
    ///             Some(RequestOptions::new().additional_header("X-Custom-Header", "X-Custom-Header")),
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn post_with_array_body_and_headers(
        &self,
        request: &Vec<String>,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/req-bodies/array-body-with-headers",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
