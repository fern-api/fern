use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct MetadataClient {
    pub http_client: HttpClient,
}

impl MetadataClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_metadata(&self, id: Option<Id>, options: Option<RequestOptions>) -> Result<Metadata, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/users/events/metadata/",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = id {
                query_params.push(("id".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

