use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ImdbClient {
    pub client: Client,
    pub base_url: String,
}

impl ImdbClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn create_movie(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_movie(&self, movie_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
