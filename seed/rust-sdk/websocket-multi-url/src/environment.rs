use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub rest: String,
    pub wss: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub rest: String,
    pub wss: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.rest,
            Self::Staging(urls) => &urls.rest,
        }
    }

    pub fn rest_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.rest,
            Self::Staging(urls) => &urls.rest,
        }
    }

    pub fn wss_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.wss,
            Self::Staging(urls) => &urls.wss,
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::Production(ProductionUrls {
            rest: "https://api.production.com".to_string(),
            wss: "wss://ws.production.com".to_string(),
        })
    }
}
