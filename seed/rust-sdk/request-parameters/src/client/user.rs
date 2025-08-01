use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UserClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl UserClient {
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

    pub async fn create_username(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/user/username",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn get_username(&self, limit: Option<i32>, id: Option<&uuid::Uuid>, date: Option<&chrono::NaiveDate>, deadline: Option<&chrono::DateTime<chrono::Utc>>, bytes: Option<&String>, user: Option<&User>, user_list: Option<&Vec<User>>, optional_deadline: Option<&Option<chrono::DateTime<chrono::Utc>>>, key_value: Option<&HashMap<String, String>>, optional_string: Option<&Option<String>>, nested_user: Option<&NestedUser>, optional_user: Option<&Option<User>>, exclude_user: Option<&User>, filter: Option<&String>, long_param: Option<i64>, big_int_param: Option<&num_bigint::BigInt>, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/user",
            None,
            {
            let mut query_params = Vec::new();
            if let Some(value) = limit {
                query_params.push(("limit".to_string(), value.to_string()));
            }
            if let Some(value) = id {
                query_params.push(("id".to_string(), value.to_string()));
            }
            if let Some(value) = date {
                query_params.push(("date".to_string(), value.to_string()));
            }
            if let Some(value) = deadline {
                query_params.push(("deadline".to_string(), value.to_string()));
            }
            if let Some(value) = bytes {
                query_params.push(("bytes".to_string(), value.to_string()));
            }
            if let Some(value) = user {
                query_params.push(("user".to_string(), value.to_string()));
            }
            if let Some(value) = user_list {
                query_params.push(("userList".to_string(), value.to_string()));
            }
            if let Some(value) = optional_deadline {
                query_params.push(("optionalDeadline".to_string(), value.to_string()));
            }
            if let Some(value) = key_value {
                query_params.push(("keyValue".to_string(), value.to_string()));
            }
            if let Some(value) = optional_string {
                query_params.push(("optionalString".to_string(), value.to_string()));
            }
            if let Some(value) = nested_user {
                query_params.push(("nestedUser".to_string(), value.to_string()));
            }
            if let Some(value) = optional_user {
                query_params.push(("optionalUser".to_string(), value.to_string()));
            }
            if let Some(value) = exclude_user {
                query_params.push(("excludeUser".to_string(), value.to_string()));
            }
            if let Some(value) = filter {
                query_params.push(("filter".to_string(), value.to_string()));
            }
            if let Some(value) = long_param {
                query_params.push(("longParam".to_string(), value.to_string()));
            }
            if let Some(value) = big_int_param {
                query_params.push(("bigIntParam".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

}

