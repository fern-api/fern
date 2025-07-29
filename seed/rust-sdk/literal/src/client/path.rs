use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PathClient {
    pub client: Client,
    pub base_url: String,
}

impl PathClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send(&self, id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
