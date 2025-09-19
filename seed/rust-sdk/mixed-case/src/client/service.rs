use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_resource(
        &self,
        resource_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/resource/{}", resource_id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn list_resources(
        &self,
        page_limit: Option<i32>,
        before_date: Option<chrono::NaiveDate>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Resource>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/resource",
                None,
                QueryBuilder::new()
                    .int("page_limit", page_limit)
                    .date("beforeDate", before_date)
                    .build(),
                options,
            )
            .await
    }
}
