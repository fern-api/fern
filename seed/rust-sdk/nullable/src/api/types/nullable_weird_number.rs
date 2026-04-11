pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum WeirdNumber {
    Integer(i64),

    OptionalFloat(Option<f64>),

    OptionalString(Option<String>),

    Double(f64),
}

impl WeirdNumber {
    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_optional_float(&self) -> bool {
        matches!(self, Self::OptionalFloat(_))
    }

    pub fn is_optional_string(&self) -> bool {
        matches!(self, Self::OptionalString(_))
    }

    pub fn is_double(&self) -> bool {
        matches!(self, Self::Double(_))
    }

    pub fn as_integer(&self) -> Option<&i64> {
        match self {
            Self::Integer(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_integer(self) -> Option<i64> {
        match self {
            Self::Integer(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_optional_float(&self) -> Option<&f64> {
        match self {
            Self::OptionalFloat(value) => value.as_ref(),
            _ => None,
        }
    }

    pub fn into_optional_float(self) -> Option<f64> {
        match self {
            Self::OptionalFloat(value) => value,
            _ => None,
        }
    }

    pub fn as_optional_string(&self) -> Option<&str> {
        match self {
            Self::OptionalString(value) => value.as_deref(),
            _ => None,
        }
    }

    pub fn into_optional_string(self) -> Option<String> {
        match self {
            Self::OptionalString(value) => value,
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
