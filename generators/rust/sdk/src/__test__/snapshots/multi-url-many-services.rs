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
impl Default for Environment {
    fn default() -> Self {
    Self::Production(ProductionUrls { api: "https://api.example.com".to_string(), auth: "https://auth.example.com".to_string(), storage: "https://storage.example.com".to_string(), analytics: "https://analytics.example.com".to_string() })
}
}
