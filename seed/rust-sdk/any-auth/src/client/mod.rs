pub mod auth;
pub mod user;

pub struct AnyAuthClient {
    pub auth: AuthClient,
    pub user: UserClient,
}

impl AnyAuthClient {
    pub fn new() -> Self {
        Self {
    auth: AuthClient::new("".to_string()),
    user: UserClient::new("".to_string())
}
    }

}


pub use auth::AuthClient;
pub use user::UserClient;