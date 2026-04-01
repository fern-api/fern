use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn send_with_raw_response(
        &self,
        request: &SendQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<SendResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
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
