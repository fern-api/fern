//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Ec2**
//! - **S3**

use crate::{ApiError, ClientConfig};

pub mod ec2;
pub mod s3;
pub struct ApiClient {
    pub config: ClientConfig,
    pub ec2: Ec2Client,
    pub s3: S3Client,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            ec2: Ec2Client::new(config.clone())?,
            s3: S3Client::new(config.clone())?,
        })
    }
}

pub use ec2::Ec2Client;
pub use s3::S3Client;
