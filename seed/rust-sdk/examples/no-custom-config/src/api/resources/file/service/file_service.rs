use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient2 {
    pub http_client: HttpClient,
}

impl ServiceClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// This endpoint returns a file by its name.
    ///
    /// # Arguments
    ///
    /// * `filename` - This is a filename
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_examples::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExamplesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .file
    ///         .service
    ///         .get_file(
    ///             &"file.txt".to_string(),
    ///             Some(RequestOptions::new().additional_header("X-File-API-Version", "0.0.2")),
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_file(
        &self,
        filename: &str,
        options: Option<RequestOptions>,
    ) -> Result<File, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/file/{}", filename),
                None,
                None,
                options,
            )
            .await
    }
}
