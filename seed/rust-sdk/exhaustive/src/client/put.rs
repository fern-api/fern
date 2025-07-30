use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PutClient {
    pub http_client: HttpClient,
}

impl PutClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn add(&self, id: &String, options: Option<RequestOptions>) -> Result<PutResponse, ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("{}", id),
            None,
            options,
        ).await
    }

}

