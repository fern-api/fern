use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::api::types::{*};

pub struct FolderClient {
    pub http_client: HttpClient,
    pub service: FolderServiceClient,
}

impl FolderClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config)?,
    service: FolderServiceClient::new(config.clone())?
})
    }

    pub async fn foo(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            None,
            None,
            options,
        ).await
    }

}

