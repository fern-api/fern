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

    pub async fn getorganization(
        &self,
        tenant_id: &str,
        organization_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Organization, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("{}/organizations/{}/", tenant_id, organization_id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn getorganizationuser(
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
                    "{}/organizations/{}/users/{}",
                    tenant_id, organization_id, user_id
                ),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn searchorganizations(
        &self,
        tenant_id: &str,
        organization_id: &str,
        request: &SearchorganizationsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Organization>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("{}/organizations/{}/search", tenant_id, organization_id),
                None,
                QueryBuilder::new()
                    .serialize("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
