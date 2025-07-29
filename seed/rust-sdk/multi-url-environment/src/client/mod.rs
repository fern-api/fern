pub mod ec_2;
pub mod s_3;

pub struct MultiUrlEnvironmentClient {
    pub ec_2: Ec2Client,
    pub s_3: S3Client,
}

impl MultiUrlEnvironmentClient {
    pub fn new() -> Self {
        Self {
    ec_2: Ec2Client::new("".to_string()),
    s_3: S3Client::new("".to_string())
}
    }

}


pub use ec_2::Ec2Client;
pub use s_3::S3Client;