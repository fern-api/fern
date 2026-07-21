use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ClientsClient {
    pub http_client: HttpClient,
}

impl ClientsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use multi_content_type_examples_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = MultiContentTypeExamplesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .clients
    ///         .create(
    ///             &ClientRequest {
    ///                 client: Some(Client {
    ///                     name: "Acme Corp".to_string(),
    ///                     email: "contact@acme.com".to_string(),
    ///                     ..Default::default()
    ///                 }),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create(
        &self,
        request: &ClientRequest,
        options: Option<RequestOptions>,
    ) -> Result<ClientResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "clients",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
