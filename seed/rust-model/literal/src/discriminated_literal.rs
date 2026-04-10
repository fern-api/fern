pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum DiscriminatedLiteral {
        #[serde(rename = "customName")]
        #[non_exhaustive]
        CustomName {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },

        #[serde(rename = "defaultName")]
        #[non_exhaustive]
        DefaultName {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<DiscriminatedLiteralDefaultNameValue>,
        },

        #[serde(rename = "george")]
        #[non_exhaustive]
        George {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<bool>,
        },

        #[serde(rename = "literalGeorge")]
        #[non_exhaustive]
        LiteralGeorge {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<bool>,
        },
}

impl DiscriminatedLiteral {
    pub fn custom_name() -> Self {
        Self::CustomName { value: None }
    }

    pub fn default_name() -> Self {
        Self::DefaultName { value: None }
    }

    pub fn george() -> Self {
        Self::George { value: None }
    }

    pub fn literal_george() -> Self {
        Self::LiteralGeorge { value: None }
    }

    pub fn custom_name_with_value(value: String) -> Self {
        Self::CustomName { value: Some(value) }
    }

    pub fn default_name_with_value(value: DiscriminatedLiteralDefaultNameValue) -> Self {
        Self::DefaultName { value: Some(value) }
    }

    pub fn george_with_value(value: bool) -> Self {
        Self::George { value: Some(value) }
    }

    pub fn literal_george_with_value(value: bool) -> Self {
        Self::LiteralGeorge { value: Some(value) }
    }
}
