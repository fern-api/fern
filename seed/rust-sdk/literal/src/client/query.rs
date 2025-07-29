use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct QueryClient {
    pub client: Client,
    pub base_url: String,
}

impl QueryClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send(&self, prompt: Option<&String>, optional_prompt: Option<&String>, alias_prompt: Option<&String>, alias_optional_prompt: Option<&String>, query: Option<&String>, stream: Option<&String>, optional_stream: Option<&String>, alias_stream: Option<&String>, alias_optional_stream: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
