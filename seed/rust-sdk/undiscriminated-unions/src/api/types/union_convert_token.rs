pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ConvertToken {
    #[serde(default)]
    pub method: String,
    #[serde(rename = "tokenId")]
    #[serde(default)]
    pub token_id: String,
}
