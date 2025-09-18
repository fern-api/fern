use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct QueryClient {
    pub http_client: HttpClient,
}

impl QueryClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(
        &self,
        prompt: Option<String>,
        optional_prompt: Option<String>,
        alias_prompt: Option<AliasToPrompt>,
        alias_optional_prompt: Option<AliasToPrompt>,
        query: Option<String>,
        stream: Option<bool>,
        optional_stream: Option<bool>,
        alias_stream: Option<AliasToStream>,
        alias_optional_stream: Option<AliasToStream>,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "query",
                None,
                QueryBuilder::new()
                    .string("prompt", prompt)
                    .serialize("optional_prompt", optional_prompt)
                    .serialize("alias_prompt", alias_prompt)
                    .serialize("alias_optional_prompt", alias_optional_prompt)
                    .structured_query("query", query)
                    .string("stream", stream)
                    .serialize("optional_stream", optional_stream)
                    .serialize("alias_stream", alias_stream)
                    .serialize("alias_optional_stream", alias_optional_stream)
                    .build(),
                options,
            )
            .await
    }
}
