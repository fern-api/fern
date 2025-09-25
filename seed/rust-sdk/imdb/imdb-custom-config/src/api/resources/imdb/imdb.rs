use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ImdbClient {
    pub http_client: HttpClient,
}

impl ImdbClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Add a movie to the database using the movies/* /... path.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_movie(
        &self,
        request: &CreateMovieRequest,
        options: Option<RequestOptions>,
    ) -> Result<MovieId, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/movies/create-movie",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn get_movie(
        &self,
        movie_id: &MovieId,
        options: Option<RequestOptions>,
    ) -> Result<Movie, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/movies/{}", movie_id.0),
                None,
                None,
                options,
            )
            .await
    }
}
