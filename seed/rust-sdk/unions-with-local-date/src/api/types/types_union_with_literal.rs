pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithLiteral {
    #[serde(rename = "fern")]
    #[non_exhaustive]
    Fern { value: String, base: String },
}

impl UnionWithLiteral {
    pub fn fern(value: String, base: String) -> Self {
        Self::Fern { value, base }
    }

    pub fn get_base(&self) -> &str {
        match self {
            Self::Fern { base, .. } => base,
        }
    }
}
