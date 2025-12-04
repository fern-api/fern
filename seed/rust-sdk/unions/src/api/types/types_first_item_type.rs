pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FirstItemType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    pub name: String,
}
