use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum WeirdNumber {
        Integer(i32),

        Nullable(Option<f32>),

        Optional(Option<Option<String>>),

        Double(f64),
}

impl WeirdNumber {
    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_nullable(&self) -> bool {
        matches!(self, Self::Nullable(_))
    }

    pub fn is_optional(&self) -> bool {
        matches!(self, Self::Optional(_))
    }

    pub fn is_double(&self) -> bool {
        matches!(self, Self::Double(_))
    }


    pub fn as_integer(&self) -> Option<&i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_integer(self) -> Option<i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_nullable(&self) -> Option<&Option<f32>> {
        match self {
                    Self::Nullable(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_nullable(self) -> Option<Option<f32>> {
        match self {
                    Self::Nullable(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_optional(&self) -> Option<&Option<Option<String>>> {
        match self {
                    Self::Optional(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_optional(self) -> Option<Option<Option<String>>> {
        match self {
                    Self::Optional(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_double(&self) -> Option<&f64> {
        match self {
                    Self::Double(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_double(self) -> Option<f64> {
        match self {
                    Self::Double(value) => Some(value),
                    _ => None,
                }
    }

}
