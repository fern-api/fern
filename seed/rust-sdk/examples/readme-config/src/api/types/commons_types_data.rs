pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Data {
    String { value: String },

    Base64 { value: Vec<u8> },
}
