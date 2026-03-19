pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenRequest {
    /// Client identifier
    #[serde(default)]
    pub client_id: String,
    /// Client secret
    #[serde(default)]
    pub client_secret: String,
}
