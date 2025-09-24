use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PatchProxyRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub application: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub require_auth: Option<bool>,
}