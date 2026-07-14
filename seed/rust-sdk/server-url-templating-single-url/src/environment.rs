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
impl Default for Environment {
    fn default() -> Self {
        Self::RegionalApiServer
    }
}
