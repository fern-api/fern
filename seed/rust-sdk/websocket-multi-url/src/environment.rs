use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub rest: String,
    pub wss: String,
}
impl Default for ProductionUrls {
    fn default() -> Self {
        Self {
            rest: "https://api.production.com".to_string(),
            wss: "wss://ws.production.com".to_string(),
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub rest: String,
    pub wss: String,
}
impl Default for StagingUrls {
    fn default() -> Self {
        Self {
            rest: "https://api.staging.com".to_string(),
            wss: "wss://ws.staging.com".to_string(),
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
}
impl Environment {
    pub fn production() -> Self {
        Self::Production(ProductionUrls::default())
    }

    pub fn staging() -> Self {
        Self::Staging(StagingUrls::default())
    }

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
        Self::Production(ProductionUrls::default())
    }
}
