use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Environment {
    #[serde(rename = "environmentA")]
    EnvironmentA,
    #[serde(rename = "environmentB")]
    EnvironmentB,
}
impl Environment {
    pub fn url(&self) -> &'static str {
    match self {
        Self::EnvironmentA => "https://api.example.a.com",
        Self::EnvironmentB => "https://api.example.b.com",
    }
}
}
impl Default for Environment {
    fn default() -> Self {
    Self::EnvironmentA
}
}
