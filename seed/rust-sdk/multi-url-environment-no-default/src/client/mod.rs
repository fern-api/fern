use crate::{ClientConfig, ClientError};

pub mod ec_2;
pub mod s_3;
pub struct MultiUrlEnvironmentNoDefaultClient {
    pub config: ClientConfig,
    pub ec_2: Ec2Client,
    pub s_3: S3Client,
}

impl MultiUrlEnvironmentNoDefaultClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        Ok(Self {
            config: config.clone(),
            ec_2: Ec2Client::new(config.clone())?,
            s_3: S3Client::new(config.clone())?
        })
    }

}

pub use ec_2::Ec2Client;
pub use s_3::S3Client;
