use crate::{ApiError, ClientConfig, HttpClient};

pub mod problem;
pub use problem::ProblemClient3;
pub struct V3Client {
    pub http_client: HttpClient,
    pub problem: ProblemClient3,
}
impl V3Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: ProblemClient3::new(config.clone())?,
        })
    }
}
