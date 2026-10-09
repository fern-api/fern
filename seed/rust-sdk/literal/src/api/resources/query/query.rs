use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct QueryClient {
    pub http_client: HttpClient,
}

impl QueryClient {
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
    ///         .query
    ///         .send(
    ///             &SendQueryRequest {
    ///                 prompt: "You are a helpful assistant".to_string(),
    ///                 optional_prompt: Some("You are a helpful assistant".to_string()),
    ///                 alias_prompt: AliasToPrompt("You are a helpful assistant".to_string()),
    ///                 alias_optional_prompt: Some(AliasToPrompt(
    ///                     "You are a helpful assistant".to_string(),
    ///                 )),
    ///                 stream: false,
    ///                 optional_stream: Some(false),
    ///                 alias_stream: AliasToStream(false),
    ///                 alias_optional_stream: Some(AliasToStream(false)),
    ///                 query: "What is the weather today".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn send(
        &self,
        request: &SendQueryRequest,
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
                "query",
                None,
                QueryBuilder::new()
                    .string("prompt", request.prompt.clone())
                    .string("optional_prompt", request.optional_prompt.clone())
                    .serialize("alias_prompt", Some(request.alias_prompt.clone()))
                    .serialize(
                        "alias_optional_prompt",
                        request.alias_optional_prompt.clone(),
                    )
                    .structured_query("query", request.query.clone())
                    .bool("stream", request.stream.clone())
                    .bool("optional_stream", request.optional_stream.clone())
                    .serialize("alias_stream", Some(request.alias_stream.clone()))
                    .serialize(
                        "alias_optional_stream",
                        request.alias_optional_stream.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }
}
