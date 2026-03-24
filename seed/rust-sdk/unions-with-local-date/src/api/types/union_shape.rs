pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum Shape {
    #[serde(rename = "circle")]
    #[non_exhaustive]
    Circle {
        #[serde(default)]
        radius: f64,
        id: String,
    },

    #[serde(rename = "square")]
    #[non_exhaustive]
    Square {
        #[serde(default)]
        length: f64,
        id: String,
    },
}

impl Shape {
    pub fn circle(radius: f64, id: String) -> Self {
        Self::Circle { radius, id }
    }

    pub fn square(length: f64, id: String) -> Self {
        Self::Square { length, id }
    }

    pub fn get_id(&self) -> &str {
        match self {
            Self::Circle { id, .. } => id,
            Self::Square { id, .. } => id,
        }
    }
}
