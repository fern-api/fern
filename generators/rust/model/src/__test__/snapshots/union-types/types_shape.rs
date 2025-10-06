pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind")]
pub enum TypesShape {
        Circle {
            value: f64,
        },

        Rectangle {
            #[serde(flatten)]
            data: TypesRectangle,
        },

        Square {
            value: f64,
        },
}
