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

    pub async fn check(&self, id: &String, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/check/{}", id),
            None,
            None,
            options,
        ).await
    }

    pub async fn ping(&self, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/ping",
            None,
            None,
            options,
        ).await
    }

}

_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_metadata(&self, shallow: Option<Option<bool>>, tag: Option<Option<String>>, options: Option<RequestOptions>) -> Result<Metadata, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/metadata",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = shallow {
                query_params.push(("shallow".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(Some(value)) = tag {
                query_params.push(("tag".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn create_big_entity(&self, request: &BigEntity, options: Option<RequestOptions>) -> Result<Response, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/big-entity",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn refresh_token(&self, request: &Option<RefreshTokenRequest>, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/refresh-token",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

