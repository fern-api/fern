pub mod client;
pub mod error;

pub use client::{MultiUrlEnvironmentNoDefaultClient, Ec2Client, S3Client};
pub use error::{ApiError};

