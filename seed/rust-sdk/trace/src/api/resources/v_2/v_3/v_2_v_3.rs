use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct V2V3Client {
    pub http_client: HttpClient,
    pub problem: V2V3ProblemClient,
}

impl V2V3Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: V2V3ProblemClient::new(config.clone())?,
        })
    }
}
