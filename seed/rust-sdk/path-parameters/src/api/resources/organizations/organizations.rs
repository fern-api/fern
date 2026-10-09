use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct OrganizationsClient {
    pub http_client: HttpClient,
}

impl OrganizationsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .organizations
    ///         .get_organization(
    ///             &"tenant_id".to_string(),
    ///             &"organization_id".to_string(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_organization(
        &self,
        tenant_id: &str,
        organization_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Organization, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/{}/organizations/{}/", tenant_id, organization_id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .organizations
    ///         .get_organization_user(
    ///             &"tenant_id".to_string(),
    ///             &"organization_id".to_string(),
    ///             &"user_id".to_string(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_organization_user(
        &self,
        tenant_id: &str,
        organization_id: &str,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "/{}/organizations/{}/users/{}",
                    tenant_id, organization_id, user_id
                ),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_path_parameters::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParametersClient::new(config).expect("Failed to build client");
    ///     client
    ///         .organizations
    ///         .search_organizations(
    ///             &"tenant_id".to_string(),
    ///             &"organization_id".to_string(),
    ///             &SearchOrganizationsQueryRequest {
    ///                 limit: Some(1),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn search_organizations(
        &self,
        tenant_id: &str,
        organization_id: &str,
        request: &SearchOrganizationsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Organization>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/{}/organizations/{}/search", tenant_id, organization_id),
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
