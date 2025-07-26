use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct AClient {
    pub client: Client,
    pub base_url: String,
}

impl AClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

}
