use crate::{ApiError, ClientConfig, HttpClient};

pub mod problem;
pub use problem::ProblemClient2;
pub mod v_3;
pub use v_3::V3Client;
pub struct V2Client {
    pub http_client: HttpClient,
    pub problem: ProblemClient2,
    pub v_3: V3Client,
}
impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: ProblemClient2::new(config.clone())?,
            v_3: V3Client::new(config.clone())?,
        })
    }
}
