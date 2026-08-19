pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum UnionWithDuplicativeDiscriminants {
    #[serde(rename = "firstItemType")]
    #[non_exhaustive]
    FirstItemType {
        #[serde(skip_serializing_if = "Option::is_none")]
        r#type: Option<String>,
        #[serde(default)]
        name: String,
    },

    #[serde(rename = "secondItemType")]
    #[non_exhaustive]
    SecondItemType {
        #[serde(skip_serializing_if = "Option::is_none")]
        r#type: Option<String>,
        #[serde(default)]
        title: String,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl UnionWithDuplicativeDiscriminants {
    pub fn first_item_type(name: String) -> Self {
        Self::FirstItemType { r#type: None, name }
    }

    pub fn second_item_type(title: String) -> Self {
        Self::SecondItemType {
            r#type: None,
            title,
        }
    }

    pub fn first_item_type_with_type(r#type: String, name: String) -> Self {
        Self::FirstItemType {
            r#type: Some(r#type),
            name,
        }
    }

    pub fn second_item_type_with_type(r#type: String, title: String) -> Self {
        Self::SecondItemType {
            r#type: Some(r#type),
            title,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
