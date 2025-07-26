use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct UnionClient {
    pub client: Client,
    pub base_url: String,
}

impl UnionClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_and_return_union(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
