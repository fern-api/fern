pub use crate::prelude::*;

/// An auth token response.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub token_type: String,
    #[serde(default)]
    pub expires_in: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}