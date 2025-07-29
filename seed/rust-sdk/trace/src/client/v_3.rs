use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct V3Client {
    pub client: Client,
    pub base_url: String,
}

impl V3Client {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

}
