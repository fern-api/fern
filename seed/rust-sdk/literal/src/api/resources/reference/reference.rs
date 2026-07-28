use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ReferenceClient {
    pub http_client: HttpClient,
}

impl ReferenceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_literal::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = LiteralClient::new(config).expect("Failed to build client");
    ///     client
    ///         .reference
    ///         .send(
    ///             &SendRequest {
    ///                 prompt: "You are a helpful assistant".to_string(),
    ///                 query: "What is the weather today".to_string(),
    ///                 stream: false,
    ///                 ending: Default::default(),
    ///                 context: SomeLiteral("You're super wise".to_string()),
    ///                 maybe_context: None,
    ///                 container_object: ContainerObject {
    ///                     nested_objects: vec![NestedObjectWithLiterals {
    ///                         literal1: "literal1".to_string(),
    ///                         literal2: "literal2".to_string(),
    ///                         str_prop: "strProp".to_string(),
    ///                     }],
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn send(
        &self,
        request: &SendRequest,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        let options = {
            let mut o = options.unwrap_or_default();
            o.additional_headers
                .entry("X-API-Version".to_string())
                .or_insert_with(|| "02-02-2024".to_string());
            o.additional_headers
                .entry("X-API-Enable-Audit-Logging".to_string())
                .or_insert_with(|| "true".to_string());
            Some(o)
        };
        self.http_client
            .execute_request(
                Method::POST,
                "reference",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
