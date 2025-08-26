use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_user(&self, tenant_id: &String, user_id: &String, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}{}", tenant_id, user_id),
            None,
            None,
            options,
        ).await
    }

    pub async fn create_user(&self, tenant_id: &String, request: &User, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/{}", tenant_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn update_user(&self, tenant_id: &String, user_id: &String, request: &User, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            &format!("/{}{}", tenant_id, user_id),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn search_users(&self, tenant_id: &String, user_id: &String, limit: Option<Option<i32>>, options: Option<RequestOptions>) -> Result<Vec<User>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}{}", tenant_id, user_id),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = limit {
                query_params.push(("limit".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

