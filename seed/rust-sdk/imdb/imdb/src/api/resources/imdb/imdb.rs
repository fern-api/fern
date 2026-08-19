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
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .imdb
    ///         .create_movie(
    ///             &CreateMovieRequest {
    ///                 title: "title".to_string(),
    ///                 rating: 1.1,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_movie(
        &self,
        request: &CreateMovieRequest,
        options: Option<RequestOptions>,
    ) -> Result<MovieId, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "movies/create-movie",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .imdb
    ///         .get_movie(&MovieId("movieId".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_movie(
        &self,
        movie_id: &MovieId,
        options: Option<RequestOptions>,
    ) -> Result<Movie, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("movies/{}", movie_id.0),
                None,
                None,
                options,
            )
            .await
    }
}
