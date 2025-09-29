use crate::types_rectangle::Rectangle;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum Shape {
        Circle {
            value: f64,
        },

        Rectangle {
            #[serde(flatten)]
            data: Rectangle,
        },

        Square {
            value: f64,
        },
}
