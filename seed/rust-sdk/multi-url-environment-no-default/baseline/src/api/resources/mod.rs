//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Ec2**
//! - **S3**

use crate::{ApiError, ClientConfig};

pub mod ec2;
pub mod s3;
pub struct MultiUrlEnvironmentNoDefaultClient {
    pub config: ClientConfig,
    pub ec2: Ec2Client,
    pub s3: S3Client,
}

impl MultiUrlEnvironmentNoDefaultClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            ec2: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .environment
                    .as_ref()
                    .map_or_else(|| cfg.base_url.clone(), |env| env.ec2_url().to_string());
                Ec2Client::new(cfg)?
            },
            s3: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .environment
                    .as_ref()
                    .map_or_else(|| cfg.base_url.clone(), |env| env.s3_url().to_string());
                S3Client::new(cfg)?
            },
        })
    }
}

pub use ec2::Ec2Client;
pub use s3::S3Client;
