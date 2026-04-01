use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_organization_with_raw_response(
        &self,
        tenant_id: &str,
        organization_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Organization>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/{}/organizations/{}/", tenant_id, organization_id),
                None,
                None,
                options,
            )
            .await
    }

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

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_organization_user_with_raw_response(
        &self,
        tenant_id: &str,
        organization_id: &str,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<User>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
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

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn search_organizations_with_raw_response(
        &self,
        tenant_id: &str,
        organization_id: &str,
        request: &SearchOrganizationsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<Organization>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
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
