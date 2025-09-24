use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct InlineUsersClient {
    pub http_client: HttpClient,
    pub inline_users: InlineUsersInlineUsersClient,
}

impl InlineUsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?,
    inline_users: InlineUsersInlineUsersClient::new(config.clone())?
})
    }

}

