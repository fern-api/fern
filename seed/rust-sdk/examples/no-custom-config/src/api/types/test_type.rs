pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Test {
    #[serde(rename = "and")]
    #[non_exhaustive]
    And {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<bool>,
    },

    #[serde(rename = "or")]
    #[non_exhaustive]
    Or {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<bool>,
    },
}

impl Test {
    pub fn and() -> Self {
        Self::And { value: None }
    }

    pub fn or() -> Self {
        Self::Or { value: None }
    }

    pub fn and_with_value(value: bool) -> Self {
        Self::And { value: Some(value) }
    }

    pub fn or_with_value(value: bool) -> Self {
        Self::Or { value: Some(value) }
    }
}
