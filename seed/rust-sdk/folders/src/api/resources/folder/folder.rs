use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct FolderClient {
    pub http_client: HttpClient,
}

impl FolderClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn foo(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "folder",
            None,
            None,
            options,
        ).await
    }

}

