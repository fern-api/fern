pub mod organization;
pub mod user;

pub struct MixedFileDirectoryClient {
    pub organization: OrganizationClient,
    pub user: UserClient,
}

impl MixedFileDirectoryClient {
    pub fn new() -> Self {
        Self {
    organization: OrganizationClient::new("".to_string()),
    user: UserClient::new("".to_string())
}
    }

}


pub use organization::OrganizationClient;
pub use user::UserClient;