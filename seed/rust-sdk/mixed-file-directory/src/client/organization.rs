use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct OrganizationClient {
    pub http_client: HttpClient,
}

impl OrganizationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn create(&self, request: &CreateOrganizationRequest, options: Option<RequestOptions>) -> Result<Organization, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/organizations/",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

