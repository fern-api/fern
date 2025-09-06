use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    pub access_token: String,
    pub expires_in: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
}