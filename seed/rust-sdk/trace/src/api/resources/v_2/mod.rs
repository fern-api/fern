use crate::{ApiError, ClientConfig, HttpClient};

pub mod problem;
pub use problem::V2ProblemClient;
pub mod v_3;
pub use v_3::V2V3Client;
pub struct V2Client {
    pub http_client: HttpClient,
    pub problem: V2ProblemClient,
    pub v_3: V2V3Client,
}
impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: V2ProblemClient::new(config.clone())?,
            v_3: V2V3Client::new(config.clone())?,
        })
    }
}
