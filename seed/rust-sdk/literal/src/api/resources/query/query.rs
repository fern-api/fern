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

    pub async fn send(
        &self,
        request: &SendQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "query",
                None,
                QueryBuilder::new()
                    .string("prompt", request.prompt.clone())
                    .serialize("optional_prompt", request.optional_prompt.clone())
                    .serialize("alias_prompt", request.alias_prompt.clone())
                    .serialize(
                        "alias_optional_prompt",
                        request.alias_optional_prompt.clone(),
                    )
                    .structured_query("query", request.query.clone())
                    .string("stream", request.stream.clone())
                    .serialize("optional_stream", request.optional_stream.clone())
                    .serialize("alias_stream", request.alias_stream.clone())
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
