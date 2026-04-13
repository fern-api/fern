use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CustomApiEnvironment {
    #[serde(rename = "production")]
    Production,
}
impl CustomApiEnvironment {
    pub fn url(&self) -> &'static str {
        match self {
            Self::Production => "https://production.com/api",
        }
    }
}
impl Default for CustomApiEnvironment {
    fn default() -> Self {
        Self::Production
    }
}
