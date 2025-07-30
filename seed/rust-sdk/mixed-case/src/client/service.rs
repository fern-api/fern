use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_resource(&self, resource_id: &String, options: Option<RequestOptions>) -> Result<Resource, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/resource/{}", resource_id),
            None,
            options,
        ).await
    }

    pub async fn list_resources(&self, page_limit: Option<i32>, before_date: Option<&chrono::NaiveDate>, options: Option<RequestOptions>) -> Result<Vec<Resource>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/resource",
            None,
            options,
        ).await
    }

}

