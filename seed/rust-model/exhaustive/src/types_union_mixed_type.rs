pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MixedType {
        Double(f64),

        Boolean(bool),

        String(String),

        StringList(Vec<String>),
}

impl MixedType {
    pub fn is_double(&self) -> bool {
        matches!(self, Self::Double(_))
    }

    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
    }

    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_stringlist(&self) -> bool {
        matches!(self, Self::StringList(_))
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

    pub fn as_boolean(&self) -> Option<&bool> {
        match self {
                    Self::Boolean(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_boolean(self) -> Option<bool> {
        match self {
                    Self::Boolean(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_string(&self) -> Option<&String> {
        match self {
                    Self::String(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_string(self) -> Option<String> {
        match self {
                    Self::String(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_stringlist(&self) -> Option<&Vec<String>> {
        match self {
                    Self::StringList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_stringlist(self) -> Option<Vec<String>> {
        match self {
                    Self::StringList(value) => Some(value),
                    _ => None,
                }
    }

}
