use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct FileNotificationClient {
    pub http_client: HttpClient,
    pub service: FileNotificationServiceClient,
}

impl FileNotificationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            service: FileNotificationServiceClient::new(config.clone())?,
        })
    }
}
