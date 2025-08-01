use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct HomepageClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl HomepageClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn get_homepage_problems(&self, options: Option<RequestOptions>) -> Result<Vec<ProblemId>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/homepage-problems",
            None,
            None,
            options,
        ).await
    }

    pub async fn set_homepage_problems(&self, request: &Vec<ProblemId>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/homepage-problems",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

