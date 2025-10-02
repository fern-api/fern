use serde::{Deserialize, Serialize};

/// An OAuth token response.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TokenResponse {
    pub access_token: String,
    pub expires_in: i64,
}
