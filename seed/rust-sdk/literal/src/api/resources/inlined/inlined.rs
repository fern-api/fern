use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct InlinedClient {
    pub http_client: HttpClient,
}

impl InlinedClient {
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
    ///         .inlined
    ///         .send(
    ///             &SendLiteralsInlinedRequest {
    ///                 prompt: "You are a helpful assistant".to_string(),
    ///                 context: Some("You're super wise".to_string()),
    ///                 query: "What is the weather today".to_string(),
    ///                 temperature: Some(10.1),
    ///                 stream: false,
    ///                 aliased_context: SomeAliasedLiteral("You're super wise".to_string()),
    ///                 maybe_context: Some(SomeAliasedLiteral("You're super wise".to_string())),
    ///                 object_with_literal: ATopLevelLiteral {
    ///                     nested_literal: ANestedLiteral {
    ///                         my_literal: "How super cool".to_string(),
    ///                     },
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn send(
        &self,
        request: &SendLiteralsInlinedRequest,
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
                "inlined",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
