use crate::{ApiError, ClientConfig, HttpClient};

pub mod inline_users;
pub use inline_users::InlineUsersClient2;
pub struct InlineUsersClient {
    pub http_client: HttpClient,
    pub inline_users: InlineUsersClient2,
}
impl InlineUsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            inline_users: InlineUsersClient2::new(config.clone())?,
        })
    }
}
