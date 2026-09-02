use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    #[serde(rename = "regionalApiServer")]
    RegionalApiServer,
}
impl Environment {
    pub fn url(&self) -> &'static str {
        match self {
            Self::RegionalApiServer => "https://api.us-east-1.prod.example.com/v1",
        }
    }
}
impl Environment {
    /// Resolves this environment's URL, substituting the given server URL variables into its
    /// URL template. Variables that are not provided fall back to their defaults.
    pub fn url_with_variables(
        &self,
        region: Option<&str>,
        server_url_environment: Option<&str>,
    ) -> String {
        let region = region.unwrap_or("us-east-1");
        let server_url_environment = server_url_environment.unwrap_or("prod");
        match self {
            Self::RegionalApiServer => format!(
                "https://api.{}.{}.example.com/v1",
                region, server_url_environment
            ),
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::RegionalApiServer
    }
}
