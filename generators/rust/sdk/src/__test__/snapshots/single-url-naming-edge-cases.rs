use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    #[serde(rename = "prod-api")]
    Prod-API,
    staging_env,
    dev-environment,
}
impl Environment {
    pub fn url(&self) -> &'static str {
    match self {
        Self::Prod-API => "https://prod-api.example.com",
        Self::staging_env => "https://staging.example.com",
        Self::dev-environment => "https://dev.example.com",
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::Prod-API
}
}
