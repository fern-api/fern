use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ServiceClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl ServiceClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn get_movie(&self, movie_id: &MovieId, options: Option<RequestOptions>) -> Result<Movie, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/movie/{}", movie_id.0),
            None,
            None,
            options,
        ).await
    }

    pub async fn create_movie(&self, request: &Movie, options: Option<RequestOptions>) -> Result<MovieId, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_metadata(&self, shallow: Option<&Option<bool>>, tag: Option<&Option<String>>, options: Option<RequestOptions>) -> Result<Metadata, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/metadata",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = shallow {
                query_params.push(("shallow".to_string(), value.to_string()));
            }
            if let Some(value) = tag {
                query_params.push(("tag".to_string(), value.to_string()));
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

}

