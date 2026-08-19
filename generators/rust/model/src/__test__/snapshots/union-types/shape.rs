use crate::rectangle::Rectangle;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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
