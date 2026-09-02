use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub auth: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
    }
}

    pub fn api_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
    }
}

    pub fn auth_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.auth,
    }
}
}
impl Environment {
    /// Returns this environment with the given server URL variables substituted into its URL
    /// templates. Variables that are not provided fall back to their defaults.
    pub fn with_url_variables(&self, region: Option<&str>) -> Self {
        let region = region.unwrap_or("us-east-1");
        match self {
            Self::Production(urls) => Self::Production(ProductionUrls {
                api: format!("https://api.{}.example.com", region),
                auth: urls.auth.clone(),
            }),
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production(ProductionUrls { api: "https://api.us-east-1.example.com".to_string(), auth: "https://auth.example.com".to_string() })
}
}
