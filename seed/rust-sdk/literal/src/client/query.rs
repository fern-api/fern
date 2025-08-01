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

    pub async fn send(&self, prompt: Option<&String>, optional_prompt: Option<&Option<String>>, alias_prompt: Option<&AliasToPrompt>, alias_optional_prompt: Option<&Option<AliasToPrompt>>, query: Option<&String>, stream: Option<&bool>, optional_stream: Option<&Option<bool>>, alias_stream: Option<&AliasToStream>, alias_optional_stream: Option<&Option<AliasToStream>>, options: Option<RequestOptions>) -> Result<SendResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "query",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = prompt {
                query_params.push(("prompt".to_string(), value.to_string()));
            }
            if let Some(value) = optional_prompt {
                query_params.push(("optional_prompt".to_string(), value.to_string()));
            }
            if let Some(value) = alias_prompt {
                query_params.push(("alias_prompt".to_string(), value.to_string()));
            }
            if let Some(value) = alias_optional_prompt {
                query_params.push(("alias_optional_prompt".to_string(), value.to_string()));
            }
            if let Some(value) = query {
                query_params.push(("query".to_string(), value.to_string()));
            }
            if let Some(value) = stream {
                query_params.push(("stream".to_string(), value.to_string()));
            }
            if let Some(value) = optional_stream {
                query_params.push(("optional_stream".to_string(), value.to_string()));
            }
            if let Some(value) = alias_stream {
                query_params.push(("alias_stream".to_string(), value.to_string()));
            }
            if let Some(value) = alias_optional_stream {
                query_params.push(("alias_optional_stream".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

