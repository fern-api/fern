pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Shape {
    #[serde(rename = "circle")]
    #[non_exhaustive]
    Circle {
        #[serde(default)]
        #[serde(with = "crate::core::number_serializers")]
        radius: f64,
        id: String,
    },

    #[serde(rename = "square")]
    #[non_exhaustive]
    Square {
        #[serde(default)]
        #[serde(with = "crate::core::number_serializers")]
        length: f64,
        id: String,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Shape {
    pub fn circle(radius: f64, id: String) -> Self {
        Self::Circle { radius, id }
    }

    pub fn square(length: f64, id: String) -> Self {
        Self::Square { length, id }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_id(&self) -> &str {
        match self {
            Self::Circle { id, .. } => id,
            Self::Square { id, .. } => id,
            Self::__Unknown(_) => {
                panic!("get_id() called on __Unknown variant; inspect the raw JSON value directly")
            }
        }
    }
}
