pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind")]
pub enum Shape {
        #[serde(rename = "circle")]
        Circle {
            value: f64,
        },

        #[serde(rename = "rectangle")]
        Rectangle {
            #[serde(flatten)]
            data: Rectangle,
        },

        #[serde(rename = "square")]
        Square {
            value: f64,
        },
}
