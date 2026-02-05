use crate::prelude::*;

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
}
impl Default for Environment {
    fn default() -> Self {
        Self::RegionalApiServer(RegionalApiServerUrls {
            base: "https://api.us-east-1.prod.example.com/v1".to_string(),
            auth: "https://auth.us-east-1.example.com".to_string(),
        })
    }
}
