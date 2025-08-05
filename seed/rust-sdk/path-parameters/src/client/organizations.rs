use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct OrganizationsClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl OrganizationsClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
    }

    pub async fn get_organization(&self, tenant_id: &String, organization_id: &String, options: Option<RequestOptions>) -> Result<Organization, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}{}", tenant_id, organization_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_organization_user(&self, tenant_id: &String, organization_id: &String, user_id: &String, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}{}{}", tenant_id, organization_id, user_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn search_organizations(&self, tenant_id: &String, organization_id: &String, limit: Option<&Option<i32>>, options: Option<RequestOptions>) -> Result<Vec<Organization>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}{}", tenant_id, organization_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

