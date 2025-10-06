pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum TypesUnionWithLiteral {
    Fern { value: String, base: String },
}

impl TypesUnionWithLiteral {
    pub fn get_base(&self) -> &String {
        match self {
            Self::Fern { base, .. } => base,
        }
    }
}
