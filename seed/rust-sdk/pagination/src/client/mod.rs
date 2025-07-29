pub mod complex;
pub mod users;

pub struct PaginationClient {
    pub complex: ComplexClient,
    pub users: UsersClient,
}

impl PaginationClient {
    pub fn new() -> Self {
        Self {
    complex: ComplexClient::new("".to_string()),
    users: UsersClient::new("".to_string())
}
    }

}


pub use complex::ComplexClient;
pub use users::UsersClient;