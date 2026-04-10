pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum DiscriminatedLiteral {
        #[serde(rename = "customName")]
        #[non_exhaustive]
        CustomName {
            value: String,
        },

        #[serde(rename = "defaultName")]
        #[non_exhaustive]
        DefaultName {
            value: String,
        },

        #[serde(rename = "george")]
        #[non_exhaustive]
        George {
            value: bool,
        },

        #[serde(rename = "literalGeorge")]
        #[non_exhaustive]
        LiteralGeorge {
            value: bool,
        },
}

impl DiscriminatedLiteral {
    pub fn custom_name(value: String) -> Self {
        Self::CustomName { value }
    }

    pub fn default_name(value: String) -> Self {
        Self::DefaultName { value }
    }

    pub fn george(value: bool) -> Self {
        Self::George { value }
    }

    pub fn literal_george(value: bool) -> Self {
        Self::LiteralGeorge { value }
    }
}
