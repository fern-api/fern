//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Ec2**
//! - **S3**

use crate::{ApiError, ClientConfig};

pub mod ec_2;
pub mod s_3;
pub struct MultiUrlEnvironmentClient {
    pub config: ClientConfig,
    pub ec_2: Ec2Client,
    pub s_3: S3Client,
}

impl MultiUrlEnvironmentClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            ec_2: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .environment
                    .as_ref()
                    .map_or_else(|| cfg.base_url.clone(), |env| env.ec_2_url().to_string());
                Ec2Client::new(cfg)?
            },
            s_3: {
                let mut cfg = config.clone();
                cfg.base_url = cfg
                    .environment
                    .as_ref()
                    .map_or_else(|| cfg.base_url.clone(), |env| env.s_3_url().to_string());
                S3Client::new(cfg)?
            },
        })
    }
}

pub use ec_2::Ec2Client;
pub use s_3::S3Client;
