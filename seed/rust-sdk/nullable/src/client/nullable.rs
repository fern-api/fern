use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct NullableClient {
    pub http_client: HttpClient,
}

impl NullableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_users(&self, usernames: Option<String>, avatar: Option<String>, activated: Option<bool>, tags: Option<Option<String>>, extra: Option<Option<bool>>, options: Option<RequestOptions>) -> Result<Vec<User>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = usernames {
                query_params.push(("usernames".to_string(), value.clone()));
            }
            if let Some(value) = avatar {
                query_params.push(("avatar".to_string(), value.clone()));
            }
            if let Some(value) = activated {
                query_params.push(("activated".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = tags {
                query_params.push(("tags".to_string(), value.clone()));
            }
            if let Some(value) = extra {
                query_params.push(("extra".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn create_user(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn delete_user(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            "/users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

