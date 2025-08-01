use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct MetadataClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl MetadataClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
    }

    pub async fn get_metadata(&self, id: Option<&Id>, options: Option<RequestOptions>) -> Result<Metadata, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users/events/metadata/",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = id {
                query_params.push(("id".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

