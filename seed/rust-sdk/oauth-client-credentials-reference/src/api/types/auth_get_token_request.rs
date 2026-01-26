pub use crate::prelude::*;

/// The request body for getting an OAuth token.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    pub client_id: String,
    pub client_secret: String,
}