pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Shape {
    #[serde(rename = "circle")]
    Circle {
        #[serde(flatten)]
        data: Circle,
        id: String,
    },

    #[serde(rename = "square")]
    Square {
        #[serde(flatten)]
        data: Square,
        id: String,
    },
}

impl Shape {
    pub fn get_id(&self) -> &str {
        match self {
            Self::Circle { id, .. } => id,
            Self::Square { id, .. } => id,
        }
    }
}
