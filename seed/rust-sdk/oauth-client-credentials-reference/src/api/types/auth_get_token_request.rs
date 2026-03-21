pub use crate::prelude::*;

/// The request body for getting an OAuth token.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
}
