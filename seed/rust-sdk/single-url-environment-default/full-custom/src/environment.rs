use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MyCustomEnvironment {
    #[serde(rename = "production")]
    Production,
}
impl MyCustomEnvironment {
    pub fn url(&self) -> &'static str {
        match self {
            Self::Production => "https://production.com/api",
        }
    }
}
impl Default for MyCustomEnvironment {
    fn default() -> Self {
        Self::Production
    }
}
