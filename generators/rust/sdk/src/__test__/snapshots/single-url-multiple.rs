use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    #[serde(rename = "production")]
    Production,
    #[serde(rename = "staging")]
    Staging,
    #[serde(rename = "development")]
    Development,
    #[serde(rename = "local")]
    Local,
}
impl Environment {
    pub fn url(&self) -> &'static str {
    match self {
        Self::Production => "https://api.example.com",
        Self::Staging => "https://staging-api.example.com",
        Self::Development => "https://dev-api.example.com",
        Self::Local => "http://localhost:3000",
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production
}
}
