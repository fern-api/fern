use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct FolderDServiceClient {
    pub http_client: HttpClient,
}

impl FolderDServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_direct_thread(&self, options: Option<RequestOptions>) -> Result<Response, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "",
            None,
            None,
            options,
        ).await
    }

}

