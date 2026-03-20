pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Address {
    #[serde(rename = "line1")]
    #[serde(default)]
    pub line_1: String,
    #[serde(rename = "line2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_2: Option<String>,
    #[serde(default)]
    pub city: String,
    #[serde(default)]
    pub state: String,
    #[serde(default)]
    pub zip: String,
    pub country: String,
}
