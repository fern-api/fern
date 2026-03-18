pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TokenRequest {
    /// Client identifier
    pub client_id: String,
    /// Client secret
    pub client_secret: String,
}