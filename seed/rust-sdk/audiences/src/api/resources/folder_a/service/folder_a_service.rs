use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_audiences::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = AudiencesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .folder_a
    ///         .service
    ///         .get_direct_thread(
    ///             &GetDirectThreadQueryRequest {
    ///                 ids: vec!["ids".to_string()],
    ///                 tags: vec!["tags".to_string()],
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_direct_thread(
        &self,
        request: &GetDirectThreadQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "",
                None,
                QueryBuilder::new()
                    .string_array("ids", request.ids.clone())
                    .string_array("tags", request.tags.clone())
                    .build(),
                options,
            )
            .await
    }
}
