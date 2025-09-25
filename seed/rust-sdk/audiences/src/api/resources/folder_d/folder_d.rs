use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FolderDClient {
    pub http_client: HttpClient,
    pub service: FolderDServiceClient,
}

impl FolderDClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: FolderDServiceClient::new(config.clone())?,
        })
    }
}
