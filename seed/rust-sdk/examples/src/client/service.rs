use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct ServiceClient {
    pub client: Client,
    pub base_url: String,
}

impl ServiceClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_file(&self, filename: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
nc fn ping(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
n::Value, ApiError> {
        todo!()
    }

    pub async fn get_metadata(&self, shallow: Option<&String>, tag: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn create_big_entity(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
