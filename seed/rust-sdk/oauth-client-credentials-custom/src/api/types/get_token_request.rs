pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct GetTokenRequest {
    #[serde(default)]
    pub cid: String,
    #[serde(default)]
    pub csr: String,
    #[serde(default)]
    pub scp: String,
    #[serde(default)]
    pub entity_id: String,
    pub audience: String,
    pub grant_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope: Option<String>,
}
