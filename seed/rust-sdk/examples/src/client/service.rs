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

    pub async fn get_exception(&self, notification_id: &String, options: Option<RequestOptions>) -> Result<Exception, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/file/notification/{}", notification_id),
            None,
            options,
        ).await
    }

}

ons>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/ping",
            None,
            options,
        ).await
    }

}

ome(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

    pub async fn get_metadata(&self, shallow: Option<&Option<bool>>, tag: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<Metadata, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/metadata",
            None,
            options,
        ).await
    }

    pub async fn create_big_entity(&self, request: &BigEntity, options: Option<RequestOptions>) -> Result<Response, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/big-entity",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

