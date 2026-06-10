use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub base: String,
    pub auth: String,
    pub upload: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.base,
        }
    }

    pub fn base_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.base,
        }
    }

    pub fn auth_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.auth,
        }
    }

    pub fn upload_url(&self) -> &str {
        match self {
            Self::Production(urls) => &urls.upload,
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::Production(ProductionUrls {
            base: "https://api.example.com/2.0".to_string(),
            auth: "https://auth.example.com/oauth2".to_string(),
            upload: "https://upload.example.com/2.0".to_string(),
        })
    }
}
