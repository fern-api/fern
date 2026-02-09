use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct OrganizationsClient {
    pub http_client: HttpClient,
}

impl OrganizationsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn get_organization(&self, tenant_id: &String, organization_id: &String, options: Option<RequestOptions>) -> Result<Organization, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}/organizations/{}/", tenant_id, organization_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_organization_user(&self, tenant_id: &String, organization_id: &String, user_id: &String, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}/organizations/{}/users/{}", tenant_id, organization_id, user_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn search_organizations(&self, tenant_id: &String, organization_id: &String, request: &SearchOrganizationsQueryRequest, options: Option<RequestOptions>) -> Result<Vec<Organization>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}/organizations/{}/search", tenant_id, organization_id),
            None,
            QueryBuilder::new().int("limit", request.limit.clone())
            .build(),
            options,
        ).await
    }

}

