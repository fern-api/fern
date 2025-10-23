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
