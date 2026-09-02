use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegionalApiServerUrls {
    pub base: String,
    pub auth: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    RegionalApiServer(RegionalApiServerUrls),
}
impl Environment {
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
impl Environment {
    /// Returns this environment with the given server URL variables substituted into its URL
    /// templates. Variables that are not provided fall back to their defaults.
    pub fn with_url_variables(
        &self,
        region: Option<&str>,
        server_url_environment: Option<&str>,
    ) -> Self {
        let region = region.unwrap_or("us-east-1");
        let server_url_environment = server_url_environment.unwrap_or("prod");
        match self {
            Self::RegionalApiServer(_) => Self::RegionalApiServer(RegionalApiServerUrls {
                base: format!(
                    "https://api.{}.{}.example.com/v1",
                    region, server_url_environment
                ),
                auth: format!("https://auth.{}.example.com", region),
            }),
        }
    }
}
impl Default for Environment {
    fn default() -> Self {
        Self::RegionalApiServer(RegionalApiServerUrls {
            base: "https://api.example.com/v1".to_string(),
            auth: "https://auth.example.com".to_string(),
        })
    }
}
