pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Metadata {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<HashMap<String, String>>,
}
