use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::api::types::{*};

pub struct InlineUsersClient {
    pub http_client: HttpClient,
    pub inline_users: InlineUsersInlineUsersClient,
}

impl InlineUsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config)?,
    inline_users: InlineUsersInlineUsersClient::new(config.clone())?
})
    }

}

