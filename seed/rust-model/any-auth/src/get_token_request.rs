pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    pub client_id: String,
    pub client_secret: String,
    pub audience: String,
    pub grant_type: GrantType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}
