use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct V2V3Client {
    pub http_client: HttpClient,
}

impl V2V3Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

}

