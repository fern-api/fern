use crate::prelude::{*};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub websocket: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalUrls {
    pub api: String,
    pub websocket: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Local(LocalUrls),
}
impl Environment {
    pub fn url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
        Self::Local(urls) => &urls.api,
    }
}

    pub fn api_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.api,
        Self::Local(urls) => &urls.api,
    }
}

    pub fn websocket_url(&self) -> &str {
    match self {
        Self::Production(urls) => &urls.websocket,
        Self::Local(urls) => &urls.websocket,
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production(ProductionUrls { api: "https://api.example.com".to_string(), websocket: "wss://ws.example.com".to_string() })
}
}
