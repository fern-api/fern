use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub auth: String,
}
impl Default for ProductionUrls {
    fn default() -> Self {
    Self {
        api: "https://api.example.com".to_string(),
        auth: "https://auth.example.com".to_string()
    }
}
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub api: String,
    pub auth: String,
}
impl Default for StagingUrls {
    fn default() -> Self {
    Self {
        api: "https://staging-api.example.com".to_string(),
        auth: "https://staging-auth.example.com".to_string()
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
        Self::Production(urls) => &urls.api,
        Self::Staging(urls) => &urls.api,
    }
}

    pub fn api_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
        Self::Staging(urls) => &urls.api,
    }
}

    pub fn auth_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.auth,
        Self::Staging(urls) => &urls.auth,
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production(ProductionUrls::default())
}
}
