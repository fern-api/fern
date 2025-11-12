pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ConvertToken {
    pub method: String,
    #[serde(rename = "tokenId")]
    pub token_id: String,
}
