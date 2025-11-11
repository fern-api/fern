use crate::prelude::{*};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub auth: String,
    pub storage: String,
    pub analytics: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub api: String,
    pub auth: String,
    pub storage: String,
    pub analytics: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevelopmentUrls {
    pub api: String,
    pub auth: String,
    pub storage: String,
    pub analytics: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
    Development(DevelopmentUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
        Self::Staging(urls) => &urls.api,
        Self::Development(urls) => &urls.api,
    }
}
}
