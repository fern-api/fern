use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn get_resource(&self, resource_id: &String, options: Option<RequestOptions>) -> Result<Resource, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/resource/{}", resource_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn list_resources(&self, request: &ListResourcesQueryRequest, options: Option<RequestOptions>) -> Result<Vec<Resource>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/resource",
            None,
            QueryBuilder::new().int("page_limit", request.page_limit.clone()).date("beforeDate", request.before_date.clone())
            .build(),
            options,
        ).await
    }

}

