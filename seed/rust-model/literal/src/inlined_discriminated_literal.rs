pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum DiscriminatedLiteral {
        #[serde(rename = "customName")]
        CustomName {
            value: String,
        },

        #[serde(rename = "defaultName")]
        DefaultName {
            value: String,
        },

        #[serde(rename = "george")]
        George {
            value: bool,
        },

        #[serde(rename = "literalGeorge")]
        LiteralGeorge {
            value: bool,
        },
}
