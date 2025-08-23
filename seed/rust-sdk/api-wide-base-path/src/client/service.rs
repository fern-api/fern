use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post(&self, path_param: &String, service_param: &String, endpoint_param: i32, resource_param: &String, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/test/{}{}{}{}", path_param, service_param, endpoint_param, resource_param),
            None,
            None,
            options,
        ).await
    }

}

