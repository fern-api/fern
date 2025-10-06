pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum CommonsTypesData {
    String { value: String },

    Base64 { value: String },
}
