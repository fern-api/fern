use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_movie(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_movie_docs(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_movie_name(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<StringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_movie_metadata(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_optional_movie(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<Option<Response>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_optional_movie_docs(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<OptionalWithDocs, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_response_property::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ResponsePropertyClient::new(config).expect("Failed to build client");
    ///     client.service.get_movie(&"string".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_optional_movie_name(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<OptionalStringResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
