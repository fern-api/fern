use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PackageClient {
    pub http_client: HttpClient,
}

impl PackageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn test(&self, for_: Option<String>, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            None,
            QueryBuilder::new().string("for", for_)
            .build(),
            options,
        ).await
    }

}

