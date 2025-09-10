use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct ImdbClient {
    pub http_client: HttpClient,
}

impl ImdbClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn create_movie(&self, request: &CreateMovieRequest, options: Option<RequestOptions>) -> Result<MovieId, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/movies/create-movie",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_movie(&self, movie_id: &MovieId, options: Option<RequestOptions>) -> Result<Movie, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/movies/{}", movie_id.0),
            None,
            None,
            options,
        ).await
    }

}

