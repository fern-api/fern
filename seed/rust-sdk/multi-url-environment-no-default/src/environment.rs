use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub ec_2: String,
    pub s_3: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub ec_2: String,
    pub s_3: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.ec_2,
            Self::Staging(urls) => &urls.ec_2,
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::Production(ProductionUrls {
            ec_2: "https://ec2.aws.com".to_string(),
            s_3: "https://s3.aws.com".to_string(),
        })
    }
}
