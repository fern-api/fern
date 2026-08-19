pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind")]
#[non_exhaustive]
pub enum Shape {
        #[serde(rename = "circle")]
        #[non_exhaustive]
        Circle {
            value: f64,
        },

        #[serde(rename = "rectangle")]
        #[non_exhaustive]
        Rectangle {
            #[serde(default)]
            #[serde(with = "crate::core::number_serializers")]
            width: f64,
            #[serde(default)]
            #[serde(with = "crate::core::number_serializers")]
            height: f64,
        },

        #[serde(rename = "square")]
        #[non_exhaustive]
        Square {
            value: f64,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl Shape {
    pub fn circle(value: f64) -> Self {
        Self::Circle { value }
    }

    pub fn rectangle(width: f64, height: f64) -> Self {
        Self::Rectangle { width, height }
    }

    pub fn square(value: f64) -> Self {
        Self::Square { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
