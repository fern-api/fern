use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct HttpMethodsClient {
    pub http_client: HttpClient,
}

impl HttpMethodsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

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
    ///         .endpoints
    ///         .http_methods
    ///         .test_get(&"id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn test_get(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/http-methods/{}", id),
                None,
                None,
                options,
            )
            .await
    }

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
    ///         .endpoints
    ///         .http_methods
    ///         .test_post(
    ///             &ObjectWithRequiredField {
    ///                 string: "string".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn test_post(
        &self,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/http-methods",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

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
    ///         .endpoints
    ///         .http_methods
    ///         .test_put(
    ///             &"id".to_string(),
    ///             &ObjectWithRequiredField {
    ///                 string: "string".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn test_put(
        &self,
        id: &str,
        request: &ObjectWithRequiredField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/http-methods/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

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
    ///         .endpoints
    ///         .http_methods
    ///         .test_patch(
    ///             &"id".to_string(),
    ///             &ObjectWithOptionalField {
    ///                 string: Some("string".to_string()),
    ///                 integer: Some(1),
    ///                 long: Some(1000000),
    ///                 double: Some(1.1),
    ///                 bool: Some(true),
    ///                 datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
    ///                 date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
    ///                 uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                 base64: Some(
    ///                     base64::engine::general_purpose::STANDARD
    ///                         .decode("SGVsbG8gd29ybGQh")
    ///                         .unwrap(),
    ///                 ),
    ///                 list: Some(vec!["list".to_string(), "list".to_string()]),
    ///                 set: Some(HashSet::from(["set".to_string()])),
    ///                 map: Some(HashMap::from([(1, "map".to_string())])),
    ///                 bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn test_patch(
        &self,
        id: &str,
        request: &ObjectWithOptionalField,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("/http-methods/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

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
    ///         .endpoints
    ///         .http_methods
    ///         .test_delete(&"id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn test_delete(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/http-methods/{}", id),
                None,
                None,
                options,
            )
            .await
    }
}
