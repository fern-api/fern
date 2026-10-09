use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct FooClient {
    pub http_client: HttpClient,
}

impl FooClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_cross_package_type_names::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = CrossPackageTypeNamesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .foo
    ///         .find(
    ///             &FindRequest {
    ///                 optional_string: OptionalString(Some("optionalString".to_string())),
    ///                 public_property: Some("publicProperty".to_string()),
    ///                 private_property: Some(1),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn find(
        &self,
        request: &FindRequest,
        options: Option<RequestOptions>,
    ) -> Result<ImportingType, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("optionalString", Some(request.optional_string.clone()))
                    .build(),
                options,
            )
            .await
    }
}
