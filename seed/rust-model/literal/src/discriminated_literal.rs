use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum DiscriminatedLiteral {
        CustomName {
            value: String,
        },

        DefaultName {
            value: String,
        },

        George {
            value: bool,
        },

        LiteralGeorge {
            value: bool,
        },
}
