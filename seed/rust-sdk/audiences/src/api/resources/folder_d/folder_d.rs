use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct FolderDClient {
    pub http_client: HttpClient,
    pub service: FolderDServiceClient,
}

impl FolderDClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
            service: FolderDServiceClient::new(config.clone())?,
        })
    }
}
