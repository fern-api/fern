use crate::{ApiError, ClientConfig, HttpClient};

pub mod b;
pub use b::BClient;
pub mod c;
pub use c::CClient;
pub mod d;
pub use d::DClient;
pub struct AClient {
    pub http_client: HttpClient,
    pub b: BClient,
    pub c: CClient,
}
impl AClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            b: BClient::new(config.clone())?,
            c: CClient::new(config.clone())?,
        })
    }
}
