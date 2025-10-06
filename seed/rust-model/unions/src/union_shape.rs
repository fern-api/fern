pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum UnionShape {
        Circle {
            #[serde(flatten)]
            data: UnionCircle,
            id: String,
        },

        Square {
            #[serde(flatten)]
            data: UnionSquare,
            id: String,
        },
}

impl UnionShape {
    pub fn get_id(&self) -> &String {
        match self {
                    Self::Circle { id, .. } => id,
                    Self::Square { id, .. } => id,
                }
    }

}
