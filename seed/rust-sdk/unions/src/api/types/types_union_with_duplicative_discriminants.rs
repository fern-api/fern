pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
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
}
