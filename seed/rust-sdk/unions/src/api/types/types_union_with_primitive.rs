pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithPrimitive {
    #[serde(rename = "integer")]
    #[non_exhaustive]
    Integer { value: i64 },

    #[serde(rename = "string")]
    #[non_exhaustive]
    r#String { value: String },
}

impl UnionWithPrimitive {
    pub fn integer(value: i64) -> Self {
        Self::Integer { value }
    }

    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }
}
