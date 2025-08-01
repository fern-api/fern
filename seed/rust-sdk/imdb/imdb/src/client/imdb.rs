use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ImdbClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl ImdbClient {
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

    pub async fn create_movie(&self, request: &CreateMovieRequest, options: Option<RequestOptions>) -> Result<MovieId, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/movies/create-movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_movie(&self, movie_id: &MovieId, options: Option<RequestOptions>) -> Result<Movie, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/movies/{}", movie_id.0),
            None,
            None,
            options,
        ).await
    }

}

