use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use chrono::{DateTime, FixedOffset, NaiveDate};
use reqwest::Method;
use uuid::Uuid;

pub struct PrimitiveClient {
    pub http_client: HttpClient,
}

impl PrimitiveClient {
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
    ///         .primitive
    ///         .get_and_return_string(&"string".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_string(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/string",
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
    ///         .primitive
    ///         .get_and_return_int(&1, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_int(
        &self,
        request: &i64,
        options: Option<RequestOptions>,
    ) -> Result<i64, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/integer",
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
    ///         .primitive
    ///         .get_and_return_long(&1000000, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_long(
        &self,
        request: &i64,
        options: Option<RequestOptions>,
    ) -> Result<i64, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/long",
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
    ///         .primitive
    ///         .get_and_return_double(&1.1, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_double(
        &self,
        request: &f64,
        options: Option<RequestOptions>,
    ) -> Result<f64, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/double",
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
    ///         .primitive
    ///         .get_and_return_bool(&true, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_bool(
        &self,
        request: &bool,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/boolean",
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
    ///         .primitive
    ///         .get_and_return_datetime(
    ///             &DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_datetime(
        &self,
        request: &DateTime<FixedOffset>,
        options: Option<RequestOptions>,
    ) -> Result<DateTime<FixedOffset>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/datetime",
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
    ///         .primitive
    ///         .get_and_return_date(
    ///             &NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_date(
        &self,
        request: &NaiveDate,
        options: Option<RequestOptions>,
    ) -> Result<NaiveDate, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/date",
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
    ///         .primitive
    ///         .get_and_return_uuid(
    ///             &Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_uuid(
        &self,
        request: &Uuid,
        options: Option<RequestOptions>,
    ) -> Result<Uuid, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/primitive/uuid",
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
    ///         .primitive
    ///         .get_and_return_base64(
    ///             &base64::engine::general_purpose::STANDARD
    ///                 .decode("SGVsbG8gd29ybGQh")
    ///                 .unwrap(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_base64(
        &self,
        request: &Vec<u8>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<u8>, ApiError> {
        self.http_client
            .execute_request_base64(
                Method::POST,
                "/primitive/base64",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
