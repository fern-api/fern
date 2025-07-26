pub mod file;
pub mod health;
pub mod service;

pub struct ExamplesClient {
    pub file: FileClient,
    pub health: HealthClient,
    pub service: ServiceClient,
}

impl ExamplesClient {
    pub fn new() -> Self {
        Self {
    file: FileClient::new("".to_string()),
    health: HealthClient::new("".to_string()),
    service: ServiceClient::new("".to_string())
}
    }

}


pub use file::FileClient;
pub use health::HealthClient;
pub use service::ServiceClient;