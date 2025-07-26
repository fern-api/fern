pub mod organizations;
pub mod user;

pub struct PathParametersClient {
    pub organizations: OrganizationsClient,
    pub user: UserClient,
}

impl PathParametersClient {
    pub fn new() -> Self {
        Self {
    organizations: OrganizationsClient::new("".to_string()),
    user: UserClient::new("".to_string())
}
    }

}


pub use organizations::OrganizationsClient;
pub use user::UserClient;