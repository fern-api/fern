use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FolderAClient {
    pub http_client: HttpClient,
    pub service: FolderAServiceClient,
}

impl FolderAClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: FolderAServiceClient::new(config.clone())?,
        })
    }
}
