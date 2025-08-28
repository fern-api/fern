use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct QueryClient {
    pub http_client: HttpClient,
}

impl QueryClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, prompt: Option<String>, optional_prompt: Option<String>, alias_prompt: Option<AliasToPrompt>, alias_optional_prompt: Option<AliasToPrompt>, query: Option<String>, stream: Option<bool>, optional_stream: Option<bool>, alias_stream: Option<AliasToStream>, alias_optional_stream: Option<AliasToStream>, options: Option<RequestOptions>) -> Result<SendResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = prompt {
                query_builder.add_simple("prompt", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = optional_prompt {
                query_builder.add_simple("optional_prompt", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = alias_prompt {
                query_builder.add_simple("alias_prompt", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = alias_optional_prompt {
                query_builder.add_simple("alias_optional_prompt", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = query {
                // Try to parse as structured query, fall back to simple if it fails
                if let Err(_) = query_builder.add_structured_query(&value) {
                    query_builder.add_simple("query", &value);
                }
            }
            if let Some(value) = stream {
                query_builder.add_simple("stream", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = optional_stream {
                query_builder.add_simple("optional_stream", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = alias_stream {
                query_builder.add_simple("alias_stream", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = alias_optional_stream {
                query_builder.add_simple("alias_optional_stream", &serde_json::to_string(&value).unwrap_or_default());
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

}

