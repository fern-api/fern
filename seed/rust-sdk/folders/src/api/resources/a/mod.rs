use crate::{ApiError, ClientConfig, HttpClient};

pub mod b;
pub use b::ABClient;
pub mod c;
pub use c::ACClient;
pub mod d;
pub use d::ADClient;
pub struct AClient {
    pub http_client: HttpClient,
    pub b: ABClient,
    pub c: ACClient,
}

impl AClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            b: ABClient::new(config.clone())?,
            c: ACClient::new(config.clone())?,
        })
    }
}
