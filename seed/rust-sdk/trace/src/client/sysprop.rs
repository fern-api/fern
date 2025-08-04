use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct SyspropClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl SyspropClient {
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

    pub async fn set_num_warm_instances(&self, language: &Language, num_warm_instances: i32, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/sysprop/num-warm-instances/{}{}", language, num_warm_instances),
            None,
            None,
            options,
        ).await
    }

    pub async fn get_num_warm_instances(&self, options: Option<RequestOptions>) -> Result<HashMap<Language, i32>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/sysprop/num-warm-instances",
            None,
            None,
            options,
        ).await
    }

}

