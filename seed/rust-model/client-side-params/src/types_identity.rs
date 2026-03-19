pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Identity {
    #[serde(default)]
    pub connection: String,
    #[serde(default)]
    pub user_id: String,
    #[serde(default)]
    pub provider: String,
    #[serde(default)]
    pub is_social: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access_token: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_in: Option<i64>,
}