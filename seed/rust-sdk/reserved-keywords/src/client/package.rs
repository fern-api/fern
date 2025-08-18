use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PackageClient {
    pub http_client: HttpClient,
}

impl PackageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn test(&self, for_: Option<String>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = for_ {
                query_params.push(("for".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

