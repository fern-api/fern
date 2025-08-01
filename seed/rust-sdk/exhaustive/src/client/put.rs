use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PutClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl PutClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn add(&self, id: &String, options: Option<RequestOptions>) -> Result<PutResponse, ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("{}", id),
            None,
            None,
            options,
        ).await
    }

}

