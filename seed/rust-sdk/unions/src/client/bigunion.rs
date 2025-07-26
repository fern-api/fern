use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct BigunionClient {
    pub client: Client,
    pub base_url: String,
}

impl BigunionClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get(&self, id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn update(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn update_many(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
