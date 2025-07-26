pub mod auth;
pub mod service;

pub struct OauthClientCredentialsWithVariablesClient {
    pub auth: AuthClient,
    pub service: ServiceClient,
}

impl OauthClientCredentialsWithVariablesClient {
    pub fn new() -> Self {
        Self {
    auth: AuthClient::new("".to_string()),
    service: ServiceClient::new("".to_string())
}
    }

}


pub use auth::AuthClient;
pub use service::ServiceClient;