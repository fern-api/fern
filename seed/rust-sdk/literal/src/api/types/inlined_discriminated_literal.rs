pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum InlinedDiscriminatedLiteral {
    CustomName { value: String },

    DefaultName { value: String },

    George { value: bool },

    LiteralGeorge { value: bool },
}
