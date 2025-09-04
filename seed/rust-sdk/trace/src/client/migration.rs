use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct MigrationClient {
    pub http_client: HttpClient,
}

impl MigrationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_attempted_migrations(&self, options: Option<RequestOptions>) -> Result<Vec<Migration>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/migration-info/all",
            None,
            None,
            options,
        ).await
    }

}

