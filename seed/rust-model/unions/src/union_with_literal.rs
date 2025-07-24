use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionWithLiteral {
        Fern {
            value: String,
            base: String,
        },
}

impl UnionWithLiteral {
    pub fn get_base(&self) -> &String {
        match self {
                    Self::Fern { base, .. } => base,
                }
    }

}
