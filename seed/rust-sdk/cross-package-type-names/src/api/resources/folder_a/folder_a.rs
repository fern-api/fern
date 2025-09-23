use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct FolderAClient {
    pub http_client: HttpClient,
    pub service: FolderAServiceClient,
}

impl FolderAClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
            service: FolderAServiceClient::new(config.clone())?,
        })
    }
}
