use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct FileClient {
    pub client: Client,
    pub base_url: String,
}

impl FileClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

}
