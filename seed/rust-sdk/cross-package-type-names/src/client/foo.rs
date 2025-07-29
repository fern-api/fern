use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct FooClient {
    pub client: Client,
    pub base_url: String,
}

impl FooClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn find(&self, optional_string: Option<&String>, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
