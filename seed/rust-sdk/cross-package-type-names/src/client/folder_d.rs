use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct FolderDClient {
    pub client: Client,
    pub base_url: String,
}

impl FolderDClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

}
