pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithLiteral {
    Fern { value: String, base: String },
}

impl UnionWithLiteral {
    pub fn get_base(&self) -> &String {
        match self {
            Self::Fern { base, .. } => base,
        }
    }
}
