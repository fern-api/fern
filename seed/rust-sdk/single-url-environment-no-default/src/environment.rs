use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    #[serde(rename = "production")]
    Production,
    #[serde(rename = "staging")]
    Staging,
}
impl Environment {
    pub fn url(&self) -> &'static str {
    match self {
        Self::Production => "https://production.com/api",
        Self::Staging => "https://staging.com/api",
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production
}
}
