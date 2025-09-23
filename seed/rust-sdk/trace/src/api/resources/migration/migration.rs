use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct MigrationClient {
    pub http_client: HttpClient,
}

impl MigrationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

    pub async fn get_attempted_migrations(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Migration>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/migration-info/all", None, None, options)
            .await
    }
}
