use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ServiceClient {
    pub http_client: HttpClient,
    pub access_token: Option<String>,
}

impl ServiceClient {
    pub fn new(config: ClientConfig, access_token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, access_token })
    }

    pub async fn post(&self, endpoint_param: &String, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/service/{}", endpoint_param),
            None,
            None,
            options,
        ).await
    }

}

