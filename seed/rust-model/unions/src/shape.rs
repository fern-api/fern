pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Shape {
        ShapeZero(ShapeZero),

        ShapeOne(ShapeOne),
}

impl Shape {
    pub fn is_shape_zero(&self) -> bool {
        matches!(self, Self::ShapeZero(_))
    }

    pub fn is_shape_one(&self) -> bool {
        matches!(self, Self::ShapeOne(_))
    }


    pub fn as_shape_zero(&self) -> Option<&ShapeZero> {
        match self {
                    Self::ShapeZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_shape_zero(self) -> Option<ShapeZero> {
        match self {
                    Self::ShapeZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_shape_one(&self) -> Option<&ShapeOne> {
        match self {
                    Self::ShapeOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_shape_one(self) -> Option<ShapeOne> {
        match self {
                    Self::ShapeOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for Shape {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ShapeZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::ShapeOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
