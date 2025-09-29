use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LangServerRequest {
    pub request: serde_json::Value,
}
