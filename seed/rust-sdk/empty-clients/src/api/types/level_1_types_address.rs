pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Address2 {
    #[serde(rename = "line1")]
    pub line_1: String,
    #[serde(rename = "line2")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_2: Option<String>,
    pub city: String,
    pub state: String,
    pub zip: String,
    pub country: String,
}
