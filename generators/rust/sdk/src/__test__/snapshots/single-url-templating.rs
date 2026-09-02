use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    #[serde(rename = "production")]
    Production,
    #[serde(rename = "local")]
    Local,
}
impl Environment {
    pub fn url(&self) -> &'static str {
    match self {
        Self::Production => "https://api.us-east-1.example.com",
        Self::Local => "http://localhost:3000",
    }
}
}
impl Environment {
    /// Resolves this environment's URL, substituting the given server URL variables into its
    /// URL template. Variables that are not provided fall back to their defaults.
    pub fn url_with_variables(&self, region: Option<&str>) -> String {
        let region = region.unwrap_or("us-east-1");
        match self {
            Self::Production => format!("https://api.{}.example.com", region),
            Self::Local => "http://localhost:3000".to_string(),
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
    Self::Production
}
}
