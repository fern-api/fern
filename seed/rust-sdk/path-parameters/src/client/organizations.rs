use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct OrganizationsClient {
    pub client: Client,
    pub base_url: String,
}

impl OrganizationsClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_organization(&self, tenant_id: &String, organization_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_organization_user(&self, tenant_id: &String, organization_id: &String, user_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn search_organizations(&self, tenant_id: &String, organization_id: &String, limit: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
