use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub ec2: String,
    pub s3: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub ec2: String,
    pub s3: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.ec2,
            Self::Staging(urls) => &urls.ec2,
        }
    }

    pub fn ec2_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.ec2,
            Self::Staging(urls) => &urls.ec2,
        }
    }

    pub fn s3_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.s3,
            Self::Staging(urls) => &urls.s3,
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::Production(ProductionUrls {
            ec2: "https://ec2.aws.com".to_string(),
            s3: "https://s3.aws.com".to_string(),
        })
    }
}
