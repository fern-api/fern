pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Shape {
    Circle {
        #[serde(flatten)]
        data: Circle,
        id: String,
    },

    Square {
        #[serde(flatten)]
        data: Square,
        id: String,
    },
}

impl Shape {
    pub fn get_id(&self) -> &String {
        match self {
            Self::Circle { id, .. } => id,
            Self::Square { id, .. } => id,
        }
    }
}
