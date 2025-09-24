use serde_json::Value;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LangServerResponse {
    pub response: serde_json::Value,
}