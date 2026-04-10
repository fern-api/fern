pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum Test {
        #[serde(rename = "and")]
        #[non_exhaustive]
        And {
            value: bool,
        },

        #[serde(rename = "or")]
        #[non_exhaustive]
        Or {
            value: bool,
        },
}

impl Test {
    pub fn and(value: bool) -> Self {
        Self::And { value }
    }

    pub fn or(value: bool) -> Self {
        Self::Or { value }
    }
}
