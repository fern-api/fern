use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct EventsClient {
    pub http_client: HttpClient,
}

impl EventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Subscribe to events with a oneOf-style query parameter that may be a
    /// scalar enum value or a list of enum values.
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
    /// use seed_union_query_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UnionQueryParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .events
    ///         .subscribe(
    ///             &SubscribeQueryRequest {
    ///                 event_type: Some(EventTypeParam::EventTypeEnum(EventTypeEnum::GroupCreated)),
    ///                 tags: Some(StringOrListParam::String("tags".to_string())),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn subscribe(
        &self,
        request: &SubscribeQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/events",
                None,
                QueryBuilder::new()
                    .serialize("event_type", request.event_type.clone())
                    .serialize("tags", request.tags.clone())
                    .build(),
                options,
            )
            .await
    }
}
