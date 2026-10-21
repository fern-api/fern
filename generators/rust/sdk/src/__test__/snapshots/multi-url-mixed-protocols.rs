use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionUrls {
    pub api: String,
    pub websocket: String,
}
impl Default for ProductionUrls {
    fn default() -> Self {
    Self {
        api: "https://api.example.com".to_string(),
        websocket: "wss://ws.example.com".to_string()
    }
}
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalUrls {
    pub api: String,
    pub websocket: String,
}
impl Default for LocalUrls {
    fn default() -> Self {
    Self {
        api: "http://localhost:3000".to_string(),
        websocket: "ws://localhost:3001".to_string()
    }
}
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Production(ProductionUrls),
    Local(LocalUrls),
}
impl Environment {
    pub fn production() -> Self {
    Self::Production(ProductionUrls::default())
}

    pub fn local() -> Self {
    Self::Local(LocalUrls::default())
}

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
    Self::Production(ProductionUrls::default())
}
}
