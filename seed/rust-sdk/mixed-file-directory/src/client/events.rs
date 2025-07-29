use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct EventsClient {
    pub client: Client,
    pub base_url: String,
}

impl EventsClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn list_events(&self, limit: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
