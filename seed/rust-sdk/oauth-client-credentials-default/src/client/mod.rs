use crate::{ClientConfig, ApiError};

pub mod auth;
pub mod nested_no_auth;
pub mod nested;
pub mod simple;
pub struct OauthClientCredentialsDefaultClient {
    pub config: ClientConfig,
    pub auth: AuthClient,
    pub nested_no_auth: NestedNoAuthClient,
    pub nested: NestedClient,
    pub simple: SimpleClient,
}

impl OauthClientCredentialsDefaultClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            auth: AuthClient::new(config.clone())?,
            nested_no_auth: NestedNoAuthClient::new(config.clone())?,
            nested: NestedClient::new(config.clone())?,
            simple: SimpleClient::new(config.clone())?
        })
    }

}

pub use auth::AuthClient;
pub use nested_no_auth::NestedNoAuthClient;
pub use nested::NestedClient;
pub use simple::SimpleClient;
