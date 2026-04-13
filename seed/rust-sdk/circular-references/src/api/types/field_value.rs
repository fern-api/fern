pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum FieldValue {
    FieldValueZero(FieldValueZero),

    FieldValueOne(FieldValueOne),

    FieldValueTwo(Box<FieldValueTwo>),
}

impl FieldValue {
    pub fn is_field_value_zero(&self) -> bool {
        matches!(self, Self::FieldValueZero(_))
    }

    pub fn is_field_value_one(&self) -> bool {
        matches!(self, Self::FieldValueOne(_))
    }

    pub fn is_field_value_two(&self) -> bool {
        matches!(self, Self::FieldValueTwo(_))
    }

    pub fn as_field_value_zero(&self) -> Option<&FieldValueZero> {
        match self {
            Self::FieldValueZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_field_value_zero(self) -> Option<FieldValueZero> {
        match self {
            Self::FieldValueZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_field_value_one(&self) -> Option<&FieldValueOne> {
        match self {
            Self::FieldValueOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_field_value_one(self) -> Option<FieldValueOne> {
        match self {
            Self::FieldValueOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_field_value_two(&self) -> Option<&Box<FieldValueTwo>> {
        match self {
            Self::FieldValueTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_field_value_two(self) -> Option<FieldValueTwo> {
        match self {
            Self::FieldValueTwo(value) => Some(*value),
            _ => None,
        }
    }
}

impl fmt::Display for FieldValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::FieldValueZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::FieldValueOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::FieldValueTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
