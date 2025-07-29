use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_username(&self, limit: Option<i32>, id: Option<&uuid::Uuid>, date: Option<&chrono::NaiveDate>, deadline: Option<&chrono::DateTime<chrono::Utc>>, bytes: Option<&String>, user: Option<&User>, user_list: Option<&Vec<User>>, optional_deadline: Option<&Option<chrono::DateTime<chrono::Utc>>>, key_value: Option<&HashMap<String, String>>, optional_string: Option<&Option<String>>, nested_user: Option<&NestedUser>, optional_user: Option<&Option<User>>, exclude_user: Option<&User>, filter: Option<&String>, options: Option<RequestOptions>) -> Result<User, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/user",
            None,
            options,
        ).await
    }

}

