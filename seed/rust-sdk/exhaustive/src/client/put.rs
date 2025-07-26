use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PutClient {
    pub client: Client,
    pub base_url: String,
}

impl PutClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn add(&self, id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
