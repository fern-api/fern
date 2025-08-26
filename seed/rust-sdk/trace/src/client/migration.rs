use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct MigrationClient {
    pub http_client: HttpClient,
}

impl MigrationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_attempted_migrations(&self, options: Option<RequestOptions>) -> Result<Vec<Migration>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/migration-info/all",
            None,
            None,
            options,
        ).await
    }

}

