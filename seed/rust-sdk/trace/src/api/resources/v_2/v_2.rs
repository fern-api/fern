use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct V2Client {
    pub http_client: HttpClient,
    pub problem: V2ProblemClient,
    pub v_3: V2V3Client,
}

impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: V2ProblemClient::new(config.clone())?,
            v_3: V2V3Client::new(config.clone())?,
        })
    }

    pub async fn test(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, "", None, None, options)
            .await
    }
}
