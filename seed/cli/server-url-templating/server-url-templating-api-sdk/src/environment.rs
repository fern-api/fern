use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegionalApiServerUrls {
    pub base: String,
    pub auth: String,
}
impl Default for RegionalApiServerUrls {
    fn default() -> Self {
        Self {
            base: "https://api.example.com/v1".to_string(),
            auth: "https://auth.example.com".to_string(),
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    RegionalApiServer(RegionalApiServerUrls),
}
impl Environment {
    pub fn regional_api_server() -> Self {
        Self::RegionalApiServer(RegionalApiServerUrls::default())
    }

    pub fn url(&self) -> &str {
        match self {
            Self::RegionalApiServer(urls) => &urls.base,
        }
    }

    pub fn base_url(&self) -> &str {
        match self {
            Self::RegionalApiServer(urls) => &urls.base,
        }
    }

    pub fn auth_url(&self) -> &str {
        match self {
            Self::RegionalApiServer(urls) => &urls.auth,
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::RegionalApiServer(RegionalApiServerUrls::default())
    }
}
