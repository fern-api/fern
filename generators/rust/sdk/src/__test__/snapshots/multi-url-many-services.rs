use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub auth: String,
    pub storage: String,
    pub analytics: String,
}
impl Default for ProductionUrls {
    fn default() -> Self {
    Self {
        api: "https://api.example.com".to_string(),
        auth: "https://auth.example.com".to_string(),
        storage: "https://storage.example.com".to_string(),
        analytics: "https://analytics.example.com".to_string()
    }
}
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StagingUrls {
    pub api: String,
    pub auth: String,
    pub storage: String,
    pub analytics: String,
}
impl Default for StagingUrls {
    fn default() -> Self {
    Self {
        api: "https://staging-api.example.com".to_string(),
        auth: "https://staging-auth.example.com".to_string(),
        storage: "https://staging-storage.example.com".to_string(),
        analytics: "https://staging-analytics.example.com".to_string()
    }
}
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevelopmentUrls {
    pub api: String,
    pub auth: String,
    pub storage: String,
    pub analytics: String,
}
impl Default for DevelopmentUrls {
    fn default() -> Self {
    Self {
        api: "https://dev-api.example.com".to_string(),
        auth: "https://dev-auth.example.com".to_string(),
        storage: "https://dev-storage.example.com".to_string(),
        analytics: "https://dev-analytics.example.com".to_string()
    }
}
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Staging(StagingUrls),
    Development(DevelopmentUrls),
}
impl Environment {
    pub fn production() -> Self {
    Self::Production(ProductionUrls::default())
}

    pub fn staging() -> Self {
    Self::Staging(StagingUrls::default())
}

    pub fn development() -> Self {
    Self::Development(DevelopmentUrls::default())
}

    pub fn url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
        Self::Staging(urls) => &urls.api,
        Self::Development(urls) => &urls.api,
    }
}

    pub fn api_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
        Self::Staging(urls) => &urls.api,
        Self::Development(urls) => &urls.api,
    }
}

    pub fn auth_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.auth,
        Self::Staging(urls) => &urls.auth,
        Self::Development(urls) => &urls.auth,
    }
}

    pub fn storage_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.storage,
        Self::Staging(urls) => &urls.storage,
        Self::Development(urls) => &urls.storage,
    }
}

    pub fn analytics_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.analytics,
        Self::Staging(urls) => &urls.analytics,
        Self::Development(urls) => &urls.analytics,
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production(ProductionUrls::default())
}
}
