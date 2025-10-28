use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_exception(
        &self,
        notification_id: &String,
        options: Option<RequestOptions>,
    ) -> Result<Exception, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/file/notification/{}", notification_id),
                None,
                None,
                options,
            )
            .await
    }
}
